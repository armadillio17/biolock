from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.attendance_summary import AttendanceSummary
from user.serializers import AttendanceSummarySerializer

class AttendanceSummaryListCreateView(APIView):
    """List all attendance summaries or create a new one"""

    def get(self, request):
        """Retrieve all attendance summaries (excluding soft-deleted ones)"""
        summaries = AttendanceSummary.objects.filter(deleted_at__isnull=True)
        serializer = AttendanceSummarySerializer(summaries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new attendance summary"""
        serializer = AttendanceSummarySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttendanceSummaryDetailView(APIView):
    """Retrieve, update, or delete a specific attendance summary"""

    def get_object(self, pk):
        """Helper method to get an attendance summary instance"""
        try:
            return AttendanceSummary.objects.get(pk=pk, deleted_at__isnull=True)
        except AttendanceSummary.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single attendance summary"""
        summary = self.get_object(pk)
        if not summary:
            return Response({"error": "Attendance summary not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceSummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update an attendance summary"""
        summary = self.get_object(pk)
        if not summary:
            return Response({"error": "Attendance summary not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceSummarySerializer(summary, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete an attendance summary"""
        summary = self.get_object(pk)
        if not summary:
            return Response({"error": "Attendance summary not found"}, status=status.HTTP_404_NOT_FOUND)
        summary.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Attendance summary deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
