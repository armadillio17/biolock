from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.report import Report
from user.serializers import ReportSerializer, AttendanceSerializer
from django.utils.timezone import now
from user.models.attendance import Attendance


class ReportListCreateView(APIView):
    """List all reports or create a new one"""

    def get(self, request):
        """Retrieve all reports (excluding soft-deleted ones)"""
        reports = Report.objects.filter(deleted_at__isnull=True)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new report"""
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportDetailView(APIView):
    """Retrieve, update, or delete a specific report"""

    def get_object(self, pk):
        """Helper method to get a report instance"""
        try:
            return Report.objects.get(pk=pk, deleted_at__isnull=True)
        except Report.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single report"""
        report = self.get_object(pk)
        if not report:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a report"""
        report = self.get_object(pk)
        if not report:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a report"""
        report = self.get_object(pk)
        if not report:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        report.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Report deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class GenerateDailyReport(APIView):
    """Generate and Save Daily Attendance Report"""
    def get(self, request):
        # user = request.user_id
        date = now().date()
        
        attendances = Attendance.objects.filter(date=date, deleted_at__isnull=True)
        serializer = AttendanceSerializer(attendances, many=True)    
        
        report = Report.objects.create(
            type="daily_attendance",
            data=serializer.data
        )
        
        return Response({
            "message": "Daily report generated successfully.",
            "report_id": report.id,
            "date": report.created_at,
            "total_records": len(serializer.data)
        }, status=status.HTTP_201_CREATED)