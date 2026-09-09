from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from user.authentication import CookieTokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now, localdate
from user.models.users import CustomUser
from user.models.attendance import Attendance
from user.models.attendance_summary import AttendanceSummary
from user.models.holiday.holiday import Holiday
from user.models.holiday.custom_holiday import CustomHoliday
from user.serializers import AttendanceSerializer, ClockInSerializer, ClockOutSerializer
from user.models.request_overtime import OvertimeRequest
from django.utils import timezone
from rest_framework import generics, filters
from user.models.location import Location
from user.utils.geofence import match_location, clean_outside_reason
from user.utils.device_binding import resolve_clockout_source, resolve_punch_source
from user.utils.attendance_totals import recalculate_summary
from decimal import Decimal, ROUND_HALF_UP
from user.utils.attendance_utils import (
    find_open_shift,
    get_open_attendance,
    has_any_attendance_today,
    get_last_attendance,
    user_has_approved_overtime,
    user_has_used_overtime_today
)

# clock_in_latitude/longitude are DecimalField(max_digits=9, decimal_places=6).
# A real GPS fix carries far more precision than that -- navigator.geolocation
# and Android both hand back doubles like 7.0805312345678 -- and the serializer
# rejects the whole punch with "no more than 9 digits in total". Round for
# storage (6 dp is ~11cm, far finer than any phone's accuracy) while the
# distance maths keeps the full-precision value.
COORD_QUANTUM = Decimal("0.000001")


def store_coord(value):
    return Decimal(str(value)).quantize(COORD_QUANTUM, rounding=ROUND_HALF_UP)


class GeoPunch:
    """Where an accepted punch happened, and why it was accepted."""

    def __init__(self, location=None, outside=False, reason=None,
                 latitude=None, longitude=None, distance_meters=None):
        self.location = location                # matched Location, else None
        self.outside = outside                  # outside every active fence
        self.reason = reason                    # justification, when outside
        self.latitude = latitude
        self.longitude = longitude
        self.distance_meters = distance_meters


def verify_within_geofence(data):
    """Check a clock-in/out payload against the admin-defined locations.

    Returns (GeoPunch, error_response). A punch from inside a fence is accepted
    as-is. A punch from outside every fence is still accepted -- staff legitimately
    step out to buy things for the office -- but only when the payload carries an
    "outside_reason", which is recorded on the attendance row for review. Without
    one the caller gets a 400 flagged "requires_outside_reason" so the client
    knows to prompt for it and retry.

    When no location is configured yet the geolock stays open, so the feature can
    be rolled out without locking everyone out before an admin has drawn the first
    fence.
    """
    locations = list(Location.objects.filter(is_active=True))
    if not locations:
        return GeoPunch(), None

    latitude = data.get("latitude")
    longitude = data.get("longitude")
    if latitude in (None, "") or longitude in (None, ""):
        return None, Response(
            {"error": "Location is required. Please enable location services and try again."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (TypeError, ValueError):
        return None, Response(
            {"error": "Invalid location coordinates."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # A stated reason must never unlock a spoofed GPS -- this stays a hard denial.
    if data.get("is_mock_location") in (True, "true", "True", 1, "1"):
        return None, Response(
            {"error": "Mock location detected. Turn off mock location apps to clock in."},
            status=status.HTTP_403_FORBIDDEN,
        )

    matched, distance = match_location(latitude, longitude, locations, data.get("accuracy"))
    if matched:
        return GeoPunch(
            location=matched,
            latitude=store_coord(latitude),
            longitude=store_coord(longitude),
            distance_meters=distance,
        ), None

    reason, reason_error = clean_outside_reason(data.get("outside_reason"))
    if reason_error:
        return None, Response(
            {
                "error": reason_error,
                # The clients key on this flag to show their reason prompt.
                "requires_outside_reason": True,
                "distance_meters": round(distance) if distance is not None else None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return GeoPunch(
        outside=True,
        reason=reason,
        latitude=store_coord(latitude),
        longitude=store_coord(longitude),
        distance_meters=distance,
    ), None


# #Views for Attendance Management
class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.filter(deleted_at__isnull=True)
    serializer_class = AttendanceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'date', 'status']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

class AttendanceDetailUpdateDeleteView(APIView):
    def get_object(self, pk):
        """Helper method to get an object or return 404"""
        try:
            return Attendance.objects.get(pk=pk, deleted_at__isnull=True)
        except Attendance.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific attendance record"""
        attendance = self.get_object(pk)
        if attendance is None:
            return Response({"error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update an attendance record"""
        attendance = self.get_object(pk)
        if attendance is None:
            return Response({"error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AttendanceSerializer(attendance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=now())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete an attendance record"""
        attendance = self.get_object(pk)
        if attendance is None:
            return Response({"error": "Attendance not found"}, status=status.HTTP_404_NOT_FOUND)

        attendance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserAttendanceView(APIView):
    def get(self, request, user_id):
        """Retrieve all non-deleted attendance records for a specific user"""
        attendances = Attendance.objects.filter(user_id=user_id, deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# class UserClockInView(APIView):
#     def post(self, request):
#         """Create a new clock-in record"""
#         # attendances = Attendance.objects.filter(deleted_at__isnull=True)
#         # serializer = ClockInSerializer(attendances, data=request.data, partial=True)
#         # serializer = ClockOutSerializer(attendances, data=request.data, partial=True)
#         serializer = ClockInSerializer(data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#         print("Validation Errors:", serializer.errors)  # Log validation errors
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserClockInView(APIView):
    """Clock-in. Authenticated, because a punch must prove who is punching.

    Before this, ``user_id`` came straight from the request body, so anyone who
    knew an employee id could clock that person in from anywhere -- which made
    the one-device rule bypassable by simply omitting the device. The identity
    now comes from the caller's own token (cookie for the web app, Authorization
    header for the mobile app); a mismatched body ``user_id`` is refused rather
    than ignored, so a stale client fails loudly.
    """

    authentication_classes = [CookieTokenAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Check if the user can clock in today."""
        try:
            today = timezone.localdate()
            print(f"Checking clock-in status for user {pk} on {today}")

            # Step 1: Check for open attendance (user is currently clocked in)
            open_attendance = get_open_attendance(pk, today)
            if open_attendance:
                return Response({
                    "has_clocked_in": True,
                    "is_clockOut": False,
                    "clock_in": open_attendance.clock_in
                }, status=status.HTTP_200_OK)

            # Step 2: Check if there's any attendance record for today
            any_attendance_today = has_any_attendance_today(pk, today)

            # Step 3: Get the last attendance record for today
            last_attendance = get_last_attendance(pk, today)

            # Step 4: Check for approved & unused overtime
            has_approved_overtime = user_has_approved_overtime(pk, today)

            # Step 5: Check if user already used their approved overtime
            has_used_overtime = user_has_used_overtime_today(pk, today)

            # Step 6: Handle cases based on attendance and overtime

            # Case: Last attendance was clock-out AND has approved OT AND hasn't used it yet
            if last_attendance and last_attendance.is_clockOut and has_approved_overtime and not has_used_overtime:
                return Response({
                    "has_clocked_in": False,
                    "is_clockOut": True,
                    "reason": "Approved overtime found. Clock-in allowed.",
                    "can_clock_in": True
                }, status=status.HTTP_200_OK)

            # Case: Already clocked out and either no OT or already used it
            elif last_attendance and last_attendance.is_clockOut:
                return Response({
                    "has_clocked_in": True,
                    "is_clockOut": True,
                    "clock_in": last_attendance.clock_in,
                    "clock_out": last_attendance.clock_out
                }, status=status.HTTP_200_OK)

            # Case: No attendance at all today
            if not any_attendance_today:
                return Response({
                    "has_clocked_in": False,
                    "is_clockOut": False,
                    "can_clock_in": True
                }, status=status.HTTP_200_OK)

            # Default fallback
            return Response({
                "has_clocked_in": False,
                "is_clockOut": True,
                "reason": "No active session or available overtime request."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response({
                "error": "An unexpected error occurred.",
                "is_clockOut": None,
                "has_clocked_in": False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
            """Create a new clock-in record and link to AttendanceSummary"""
            try:
                punching_user = request.user
                user_id = punching_user.id
                claimed_id = request.data.get("user_id")
                if claimed_id not in (None, "") and str(claimed_id) != str(user_id):
                    return Response(
                        {"error": "You can only clock in for yourself."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                now = timezone.localtime()
                today = now.date()

                print(f"User {user_id} attempting to clock in on {today}")

                # One device, one person -- and keep punches on the app.
                punch_source, punch_device, device_error = resolve_punch_source(
                    punching_user, request.data)
                if device_error:
                    return device_error

                # Geolock: the punch must come from inside an active location
                geo, geo_error = verify_within_geofence(request.data)
                if geo_error:
                    return geo_error

                # Must use the same definition of "open" as clock-out, or an
                # overnight shift is invisible here and the employee starts a
                # duplicate one.
                existing = find_open_shift(user_id)

                if existing:
                    is_clocked_out = Attendance.objects.filter(
                        user_id=user_id,
                        clock_in__date=today,
                        is_clockOut=True
                    ).exists()

                    if is_clocked_out:
                        return Response({"error": "Already clocked out."}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response({
                            "error": "Already clocked in and not yet clocked out.",
                            "clock_in": existing.clock_in
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Determine if today is a holiday or custom holiday
                holiday = Holiday.objects.filter(holiday_date=today).first()
                custom_holiday = None

                data = request.data.copy()
                # The identity comes from the authenticated session, not the
                # body, so put it where the serializer expects to find it.
                data['user_id'] = user_id

                if holiday:
                    print(f"Today is a regular holiday: {holiday.holiday_name}")
                    data['holiday'] = holiday.id
                elif CustomHoliday.objects.filter(custom_holiday_date=today).exists():
                    custom_holiday = CustomHoliday.objects.get(custom_holiday_date=today)
                    print(f"Today is a custom holiday: {custom_holiday.custom_holiday_name}")
                    data['custom_holiday'] = custom_holiday.id
                else:
                    print("Today is not a holiday.")

                # Check for approved and unused OvertimeRequest
                has_approved_overtime = OvertimeRequest.objects.filter(
                    user_id=user_id,
                    date=today,
                    status='approved',
                    used=False
                ).exists()

                # Always use current time for new clock-in
                clock_in_time = now
                print(f"Setting clock_in to: {clock_in_time}")

                # Inject clock_in_time into data
                data['clock_in'] = clock_in_time
                data['date'] = today
                data['is_overtime_clock_in'] = has_approved_overtime

                # Keep an audit trail of where the punch was accepted, including
                # the stated reason when it came from outside the work area.
                if geo.latitude is not None:
                    data['clock_in_latitude'] = geo.latitude
                    data['clock_in_longitude'] = geo.longitude
                if geo.location:
                    data['clock_in_location'] = geo.location.id
                if geo.outside:
                    data['is_clock_in_outside'] = True
                    data['clock_in_outside_reason'] = geo.reason
                data['punch_source'] = punch_source
                if punch_device:
                    data['punch_device'] = punch_device.id
                if punch_source == "browser":
                    # Recorded, but it earns nothing until an admin agrees it
                    # was a real punch.
                    data['review_status'] = "pending" 

                # Serialize and save the Attendance
                serializer = ClockInSerializer(data=data)
                if serializer.is_valid():
                    attendance = serializer.save(clock_in=clock_in_time)

                    # If there's an approved OvertimeRequest and not yet used, mark it as used
                    if has_approved_overtime:
                        overtime_request = OvertimeRequest.objects.filter(
                            user=attendance.user,
                            date=today,
                            status='approved',
                            used=False
                        ).first()

                        if overtime_request:
                            overtime_request.used = True
                            overtime_request.save()
                            print("Marked OvertimeRequest as used.")
                        else:
                            print("No unused approved OvertimeRequest found.")

                    # Now create or update the AttendanceSummary with this attendance
                    AttendanceSummary.objects.update_or_create(
                        user=attendance.user,
                        date=today,
                        defaults={
                            'attendance': attendance,
                        }
                    )

                    print("Clock-in successful")
                    return Response(serializer.data, status=status.HTTP_201_CREATED)

                print("Validation Errors:", serializer.errors)
                return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                print(f"Unexpected Error: {str(e)}")
                return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UserClockOutView(APIView):
    """Clock-out. Authenticated for the same reason as clock-in."""

    authentication_classes = [CookieTokenAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update clock out and update attendance summary with total working hours"""
        
        today = timezone.localtime().date()

        punching_user = request.user
        user_id = punching_user.id
        claimed_id = request.data.get("user_id")
        if claimed_id not in (None, "") and str(claimed_id) != str(user_id):
            return Response(
                {"error": "You can only clock out for yourself."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Geolock: clocking out must happen on site too, otherwise a shift can be
        # started at the office and closed from home.

        # A clock-out is never refused on the handset: the shift is already open
        # and was device-verified at clock-in, so blocking here prevents nothing
        # and strands the employee in a shift they cannot close. Record it and
        # hold it for review instead.
        punch_source, _punch_device, held_for_review = resolve_clockout_source(
            punching_user, request.data)

        geo, geo_error = verify_within_geofence(request.data)
        if geo_error:
            return geo_error

        # Not date-scoped: an overnight shift is still the one being closed, and
        # the old clock_in__date filter compared a UTC date against the business
        # day, so a morning clock-in could never be closed at all.
        attendance = find_open_shift(user_id)

        if not attendance:
            return Response({"error": "Already clocked out for today"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClockOutSerializer(attendance, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save clock-out time
        attendance = serializer.save()

        # Held time never reaches a payslip: recalculate_summary() skips
        # anything still awaiting review.
        if held_for_review or punch_source == "browser":
            attendance.review_status = "pending"
            attendance.save(update_fields=["review_status", "updated_at"])

        # ClockOutSerializer.update() builds the instance by hand and ignores any
        # extra validated data, so the audit trail is written here instead.
        if geo.latitude is not None:
            attendance.clock_out_latitude = geo.latitude
            attendance.clock_out_longitude = geo.longitude
            attendance.clock_out_location = geo.location
            attendance.is_clock_out_outside = geo.outside
            attendance.clock_out_outside_reason = geo.reason
            attendance.save(update_fields=[
                "clock_out_latitude", "clock_out_longitude", "clock_out_location",
                "is_clock_out_outside", "clock_out_outside_reason", "updated_at",
            ])

        if attendance.clock_in and attendance.clock_out:
            duration = attendance.clock_out - attendance.clock_in
            total_seconds = duration.total_seconds()
            total_hours = round(total_seconds / 3600, 2)

            regular_hours = 0.0
            overtime_hours = 0.0

            is_overtime_session = getattr(attendance, 'is_overtime_clock_in', False)

            if is_overtime_session:
                # In overtime session, all time is counted as overtime
                overtime_hours = total_hours
            else:
                # Regular day — max 8 hours regular, ignore excess
                regular_hours = min(total_hours, 8.0)

            # Update attendance record
            attendance.working_hours = regular_hours
            attendance.overtime_hours = overtime_hours
            attendance.save()

            # Rebuild the day's totals. The helper leaves out punches that are
            # still awaiting review, so held time never reaches a payslip.
            recalculate_summary(attendance.user, today)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DailyAttendanceView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records for a specific user"""
        user = request.user_id
        date = localdate()
        
        attendances = Attendance.objects.filter(date=date, deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DailyAttendanceCountView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records for a specific user"""
        # user = request.user_id
        date = localdate()
        
        attendances = Attendance.objects.filter(date=date, deleted_at__isnull=True)
        # serializer = AttendanceSerializer(attendances, many=True)
        absent_count = attendances.filter(status='absent').values('id').distinct().count()
        working_count = attendances.filter(status='working').values('id').distinct().count()
        on_leave_count = attendances.filter(status='on_leave').values('id').distinct().count()
        on_break_count = attendances.filter(status='on_break').values('id').distinct().count()
        day_off_count = attendances.filter(status='day_off').values('id').distinct().count()
        return Response({
            "absentCount": absent_count,
            "workingCount": working_count,
            "onLeaveCount": on_leave_count,
            "onBreakCount": on_break_count,
            "dayOffCount": day_off_count,
            }, status=status.HTTP_200_OK)

        