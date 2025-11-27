from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from user.models.attendance import Attendance
from user.models.attendance_summary import AttendanceSummary
from user.models.holiday.holiday import Holiday
from user.models.holiday.custom_holiday import CustomHoliday
from user.serializers import AttendanceSerializer, ClockInSerializer, ClockOutSerializer
from user.models.request_overtime import OvertimeRequest
from django.utils import timezone
from rest_framework import generics, filters
from user.utils.attendance_utils import (
    get_open_attendance,
    has_any_attendance_today,
    get_last_attendance,
    user_has_approved_overtime,
    user_has_used_overtime_today
)

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
        return Response({"message": "Attendance record soft deleted"}, status=status.HTTP_204_NO_CONTENT)

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
    def get(self, request, pk):
        """Check if the user can clock in today."""
        try:
            today = timezone.now().date()
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
                user_id = request.data.get("user_id")
                now = timezone.localtime()
                today = now.date()

                print(f"User {user_id} attempting to clock in on {today}")

                # Check for existing open attendance (clocked in but not out)
                existing = Attendance.objects.filter(
                    user_id=user_id,
                    clock_in__date=today,
                    clock_out__isnull=True
                ).first()

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
    def put(self, request):
        """Update clock out and update attendance summary with total working hours"""
        
        today = timezone.localtime().date()
        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        attendance = Attendance.objects.filter(
            user_id=user_id,
            clock_in__date=today,
            clock_out__isnull=True
        ).first()

        if not attendance:
            return Response({"error": "Already clocked out for today"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ClockOutSerializer(attendance, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Save clock-out time
        attendance = serializer.save()

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

            # Aggregate working hours and overtime hours for the day
            all_attendance_today = Attendance.objects.filter(
                user_id=user_id,
                clock_in__date=today,
                deleted_at__isnull=True
            )

            total_working_hours = sum(attendance.working_hours for attendance in all_attendance_today)
            total_overtime_hours = sum(attendance.overtime_hours for attendance in all_attendance_today)

            # Update or create attendance summary with aggregated values
            AttendanceSummary.objects.update_or_create(
                user=attendance.user,
                date=today,
                defaults={
                    "total_working_hours": total_working_hours,
                    "total_overtime_hours": total_overtime_hours,
                }
            )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DailyAttendanceView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records for a specific user"""
        user = request.user_id
        date = now().date()
        
        attendances = Attendance.objects.filter(date=date, deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class DailyAttendanceCountView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records for a specific user"""
        # user = request.user_id
        date = now().date()
        
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

        