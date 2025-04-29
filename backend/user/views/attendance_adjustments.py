from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.attendance_adjustments import AttendanceAdjustments
from user.serializers import AttendanceAdjustmentsSerializer

class AttendanceAdjustmentsListCreateView(APIView):
    """List all attendance adjustments or create a new one"""

    def get(self, request):
        """Retrieve all attendance adjustments (excluding soft-deleted ones)"""
        adjustments = AttendanceAdjustments.objects.filter(deleted_at__isnull=True)
        serializer = AttendanceAdjustmentsSerializer(adjustments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new attendance adjustment"""
        serializer = AttendanceAdjustmentsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceAdjustmentsDetailView(APIView):
    """Retrieve, update, or delete a specific attendance adjustment"""

    def get_object(self, pk):
        """Helper method to get an attendance adjustment instance"""
        try:
            return AttendanceAdjustments.objects.get(pk=pk, deleted_at__isnull=True)
        except AttendanceAdjustments.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single attendance adjustment"""
        adjustment = self.get_object(pk)
        if not adjustment:
            return Response({"error": "Attendance adjustment not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceAdjustmentsSerializer(adjustment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update an attendance adjustment"""
        adjustment = self.get_object(pk)
        if not adjustment:
            return Response({"error": "Attendance adjustment not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceAdjustmentsSerializer(adjustment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete an attendance adjustment"""
        adjustment = self.get_object(pk)
        if not adjustment:
            return Response({"error": "Attendance adjustment not found"}, status=status.HTTP_404_NOT_FOUND)
        adjustment.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Attendance adjustment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
