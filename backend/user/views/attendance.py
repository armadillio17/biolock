from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from user.models.attendance import Attendance
from user.models.attendance_summary import AttendanceSummary
from user.models.holiday import Holiday
from user.serializers import AttendanceSerializer, ClockInSerializer, ClockOutSerializer
from user.models.request_overtime import OvertimeRequest
from django.utils import timezone

class AttendanceListCreateView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records"""
        attendances = Attendance.objects.filter(deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # def post(self, request):
    #     """Create a new attendance record"""
    #     serializer = AttendanceSerializer(data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        """Check if the user has clocked in today and return clock-out status."""
        try:
            today = now().date()

            attendance = Attendance.objects.filter(
                user_id=pk,
                clock_in__date=today,
                clock_in__isnull=False,
                deleted_at__isnull=True
            ).first()

            if attendance:
                return Response({
                    "has_clocked_in": True,
                    "is_clockOut": attendance.is_clockOut,
                    "clock_in": attendance.clock_in,
                    "clock_out": attendance.clock_out
                }, status=status.HTTP_200_OK)
            else:
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

        except Exception as e:
            print(f"Unexpected Error: {str(e)}")
            return Response({
                "error": "An unexpected error occurred.",
                "is_clockOut": None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        """Create a new clock-in record and link to AttendanceSummary"""

        try:
            user_id = request.data.get("user_id")
            now = timezone.localtime()
            today = now.date()

            print("user_id:", user_id)
            print("Incoming request data:", request.data)

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

            # Check if today is a holiday
            holiday = Holiday.objects.filter(holiday_date=today).first()

            # Prepare data for serializer
            data = request.data.copy()

            if holiday:
                print(f"Today is a holiday: {holiday.holiday_name}")
                data['holiday'] = holiday.id
            else:
                print("Today is not a holiday.")

            # Serialize and save the Attendance
            serializer = ClockInSerializer(data=data)
            if serializer.is_valid():
                attendance = serializer.save()  # Save returns the Attendance instance

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
    def put(self, request):
        """Update clock out and create/update attendance summary with precise overtime calculation"""
        
        today = now().date()
        user_id = request.data["user_id"]
        REGULAR_HOURS = 8
        MIN_OVERTIME_MINUTES = 30
        
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
                
                # ---- Calculate overtime ----
                overtime_hours = 0.0
                if total_hours > REGULAR_HOURS:
                    overtime_minutes = (total_hours - REGULAR_HOURS) * 60
                    
                    # Only count if overtime meets minimum threshold (30 mins)
                    if overtime_minutes >= MIN_OVERTIME_MINUTES:
                        overtime_hours = round((total_seconds - (REGULAR_HOURS * 3600)) / 3600, 2)
                
                # ---- Save working hours and overtime ----
                attendance.working_hours = total_hours
                attendance.save()

                # ---- Create/update summary ----
                summary, created = AttendanceSummary.objects.get_or_create(
                    user=attendance.user,
                    date=today,
                    defaults={
                        "total_working_hours": total_hours,
                        "total_leave_hours": 0,
                        "total_absences": 0,
                    }
                )
                if not created:
                    summary.total_working_hours = total_hours
                    summary.save()

                # ---- Create Pending Overtime Request if applicable ----
                if overtime_hours > 0:
                    OvertimeRequest.objects.create(
                        user=attendance.user,
                        date=today,
                        requested_hours=overtime_hours,
                        status='pending'
                    )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
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

        