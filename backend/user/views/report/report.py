from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.report import Report
from user.serializers import ReportSerializer, AttendanceSerializer
from django.utils.timezone import now
from user.models.attendance import Attendance
from user.utils.notification_history import log_notification 
from django.utils.dateparse import parse_date

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

        log_notification(
            user_id=request.user.id,
            notification_type="Generate Report",
            data={
                "status": "Completed",
                "details": "Report generated",
            }
        )
        
        return Response({
            "message": "Daily report generated successfully.",
            "report_id": report.id,
            "date": report.created_at,
            "total_records": len(serializer.data)
        }, status=status.HTTP_201_CREATED)

class GenerateDateRangeReport(APIView):
    """Generate and Save Attendance Report for a Date Range"""

    def get(self, request):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # Use today's date if no dates are provided
        if not start_date or not end_date:
            today = now().date()
            start_date = end_date = today
        else:
            start_date = parse_date(start_date)
            end_date = parse_date(end_date)

        if not start_date or not end_date:
            return Response({
                "error": "Invalid start_date or end_date format. Use YYYY-MM-DD."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Filter attendances between the date range (inclusive)
        attendances = Attendance.objects.filter(
            date__range=[start_date, end_date],
            deleted_at__isnull=True
        )
        serializer = AttendanceSerializer(attendances, many=True)

        report = Report.objects.create(
            type="attendance_report",
            data=serializer.data,
            start_date=start_date,
            end_date=end_date
        )

        log_notification(
            user_id=request.user.id,
            notification_type="Generate Report",
            data={
                "status": "Completed",
                "details": f"Report generated for {start_date} to {end_date}",
            }
        )

        return Response({
            "message": "Attendance report generated successfully.",
            "report_id": report.id,
            "date_range": f"{start_date} to {end_date}",
            "total_records": len(serializer.data)
        }, status=status.HTTP_201_CREATED)