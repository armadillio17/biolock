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

class AttendanceListCreateView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records"""
        attendances = Attendance.objects.filter(deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

class UserClockInView(APIView):
    def get(self, request, pk):
            """Check if the user can clock in today."""
            try:
                today = now().date()
                print(f"Checking clock-in status for user {pk} on {today}")
                attendance = Attendance.objects.filter(
                    user_id=pk,
                    clock_in__date=today,
                    clock_in__isnull=False,
                    deleted_at__isnull=True
                ).first()

                # Check for approved and UNUSED overtime request
                has_approved_overtime = OvertimeRequest.objects.filter(
                    user_id=pk,
                    date=today,
                    status='approved',
                    used=False  # ← Only consider requests that haven't been used
                ).exists()

                if attendance:
                    # If user has clocked out and has NO unused approved overtime → prevent new clock-in
                    if attendance.is_clockOut and not has_approved_overtime:
                        return Response({
                            "has_clocked_in": True,
                            "is_clockOut": attendance.is_clockOut,
                            "clock_in": attendance.clock_in,
                            "clock_out": attendance.clock_out
                        }, status=status.HTTP_200_OK)

                    # If user has clocked out BUT has an unused approved overtime → allow clock-in
                    elif attendance.is_clockOut and has_approved_overtime:
                        return Response({
                            "has_clocked_in": False,
                            "is_clockOut": True,
                            "reason": "Approved overtime found. Clock-in allowed."
                        }, status=status.HTTP_200_OK)

                    # If user hasn't clocked out yet
                    else:
                        return Response({
                            "has_clocked_in": True,
                            "is_clockOut": False,
                            "clock_in": attendance.clock_in
                        }, status=status.HTTP_200_OK)

                else:
                    # No attendance record today → user can clock in
                    return Response({
                        "has_clocked_in": False,
                        "is_clockOut": False
                    }, status=status.HTTP_200_OK)

            except Exception as e:
                print(f"Unexpected Error: {str(e)}")
                return Response({
                    "error": "An unexpected error occurred.",
                    "is_clockOut": None,
                    "has_clocked_in": False
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #TODO This code is bloated need to refactor this
    # Note: May be we could continue the time if update the clock out to null when clock in again in overtime.
    def post(self, request):
        """Create a new clock-in record and link to AttendanceSummary"""

        try:
            user_id = request.data.get("user_id")
            now = timezone.localtime()
            today = now.date()

            # Check for existing open attendance
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
                    return Response({"error": "Already clocked in and not yet clocked out."}, status=status.HTTP_400_BAD_REQUEST)

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

            # Check for approved OvertimeRequest AFTER determining today
            has_approved_overtime = OvertimeRequest.objects.filter(
                user_id=user_id,
                date=today,  # Now we can safely use today instead of attendance.clock_in.date()
                status='approved'
            ).exists()

            clock_in_time = now  # Default to current time

            if has_approved_overtime:
                # Get the latest clock_out time for the day
                latest_clock_out = Attendance.objects.filter(
                    user_id=user_id,
                    clock_out__isnull=False,
                    clock_in__date=today
                ).order_by('-clock_out').values_list('clock_out', flat=True).first()

                if latest_clock_out:
                    clock_in_time = latest_clock_out
                    print(f"Approved overtime found. Continuing from last clock-out: {clock_in_time}")
                else:
                    print("Approved overtime found, but no previous clock-out. Using current time.")

            # Inject clock_in_time into data
            data['clock_in'] = clock_in_time
            data['date'] = today

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

                return Response(serializer.data, status=status.HTTP_201_CREATED)

            print("Validation Errors:", serializer.errors)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserClockOutView(APIView):
    #TODO This code is bloated need to refactor this
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
        
        if serializer.is_valid():
            attendance = serializer.save()

            if attendance.clock_in and attendance.clock_out:
                duration = attendance.clock_out - attendance.clock_in
                total_seconds = duration.total_seconds()
                total_hours = round(total_seconds / 3600, 2)

                # ---- Base working hours ----
                attendance.working_hours = total_hours

                overtime_hours = 0.0

                # ---- Overtime Calculation (only if is_overtime_clock_in is True) ----
                if attendance.is_overtime_clock_in:
                    base_regular_hours = 8.0
                    if total_hours > base_regular_hours:
                        potential_overtime = total_hours - base_regular_hours
                        minimum_overtime_threshold = 0.5

                        if potential_overtime >= minimum_overtime_threshold:
                            overtime_hours = round(potential_overtime, 2)
                            attendance.overtime_hours = overtime_hours
                            print(f"Overtime recorded: {overtime_hours} hours")
                        else:
                            attendance.overtime_hours = 0.0
                            print("No overtime recorded: less than 30 minutes.")
                    else:
                        attendance.overtime_hours = 0.0
                        print("No overtime recorded: under 8 hours.")
                else:
                    print("Not an overtime session. No overtime recorded.")

                attendance.save()

                # ---- Create/update summary ----
                summary, created = AttendanceSummary.objects.get_or_create(
                    user=attendance.user,
                    date=today,
                    defaults={
                        "total_working_hours": total_hours,
                        "total_overtime_hours": overtime_hours,
                        "total_leave_hours": 0,
                        "total_absences": 0,
                    }
                )
                if not created:
                    summary.total_working_hours = total_hours
                    summary.total_overtime_hours = overtime_hours
                    summary.save()

            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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

        