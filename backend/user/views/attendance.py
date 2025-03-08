from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from user.models.attendance import Attendance
from user.serializers import AttendanceSerializer, ClockInSerializer, ClockOutSerializer

class AttendanceListCreateView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records"""
        attendances = Attendance.objects.filter(deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new attendance record"""
        serializer = AttendanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    def get(self, request):
        """Retrieve all non-deleted attendance records for a specific user"""
        attendances = Attendance.objects.filter(user_id=request.user.id, deleted_at__isnull=True)
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
    def post(self, request):
        """Create a new clock-in record"""
        try:
            serializer = ClockInSerializer(data=request.data)  # `partial=True` not needed for POST
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            print("Validation Errors:", serializer.errors)  # Log validation errors
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Unexpected Error: {str(e)}")  # Log unexpected errors
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class UserClockOutView(APIView):
    def post(self, request):
        """Update clock out based on the clock-in record"""
        
        today = now().date()
        user = request.data["user_id"]
        
        attendance = Attendance.objects.filter(user_id=user, clock_in__date=today, clock_out__isnull=True).first()
        
        if not attendance:
            return Response({"error": "Already clock in for today"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ClockOutSerializer(attendance, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
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