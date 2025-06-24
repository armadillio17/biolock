import json
from datetime import datetime
from io import BytesIO
from django.http import HttpResponse
from django.utils.timezone import make_aware
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

from user.models.system_history import SystemHistory
from user.serializers import SystemHistorySerializer


class SystemHistoryListCreateView(APIView):
    """List all system logs or create a new one"""
    def get(self, request):
        """Retrieve all system logs (excluding soft-deleted ones)"""
        system_logs = SystemHistory.objects.filter(deleted_at__isnull=True)
        serializer = SystemHistorySerializer(system_logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new system log"""
        serializer = SystemHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SystemHistoryDetailView(APIView):
    """Retrieve, update, or delete a specific system log"""

    def get_object(self, pk):
        """Helper method to get a system log instance"""
        try:
            return SystemHistory.objects.get(pk=pk, deleted_at__isnull=True)
        except SystemHistory.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single system log"""
        system_log = self.get_object(pk)
        if not system_log:
            return Response({"error": "System log not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SystemHistorySerializer(system_log)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a system log"""
        system_log = self.get_object(pk)
        if not system_log:
            return Response({"error": "System log not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SystemHistorySerializer(system_log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a system log"""
        system_log = self.get_object(pk)
        if not system_log:
            return Response({"error": "System log not found"}, status=status.HTTP_404_NOT_FOUND)
        system_log.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "System log deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


def format_type(type_str: str) -> str:
    """Format snake_case to Title Case"""
    return " ".join(word.capitalize() for word in type_str.split("_"))


class GeneratePDFReportView(APIView):
    """
    Generates a downloadable PDF report of system history
    Accepts optional query params: start_date, end_date (format: YYYY-MM-DD)
    """

    def get(self, request, *args, **kwargs):
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        # Build queryset
        queryset = SystemHistory.objects.filter(deleted_at__isnull=True)

        if start_date_str:
            start_date = make_aware(datetime.combine(parse_date(start_date_str), datetime.min.time()))
            queryset = queryset.filter(created_at__gte=start_date)

        if end_date_str:
            end_date = make_aware(datetime.combine(parse_date(end_date_str), datetime.max.time()))
            queryset = queryset.filter(created_at__lte=end_date)

        logs = list(queryset.values("created_at", "type", "data"))

        # Create buffer and document
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=50, leftMargin=50,
                                topMargin=60, bottomMargin=60)

        styles = getSampleStyleSheet()
        style_title = styles["Title"]
        style_normal = styles["Normal"]
        style_normal.fontSize = 8

        elements = []

        # Title
        elements.append(Paragraph("System Activity Logs Report", style_title))
        elements.append(Spacer(1, 12))

        # Date Range Info
        elements.append(Paragraph(f"Date Range: {start_date_str or 'All'} - {end_date_str or 'All'}", style_normal))
        elements.append(Spacer(1, 24))

        # Table Data
        table_data = [["Date & Time", "Activity Type", "Details"]]

        for log in logs:
            try:
                parsed_data = json.loads(log["data"]) if isinstance(log["data"], str) else log["data"]
            except json.JSONDecodeError:
                parsed_data = {}

            status_val = parsed_data.get("status", "")
            details_val = parsed_data.get("details", "")

            row = [
                log["created_at"].strftime("%Y-%m-%d %H:%M:%S"),
                format_type(log["type"]),
                f"Status: {status_val}, Details: {details_val}"
            ]
            table_data.append(row)

        # Draw Table
        col_widths = [130, 100, 250]  # Adjust column widths
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        elements.append(table)

        # Build PDF
        doc.build(elements)

        # Prepare response
        pdf = buffer.getvalue()
        buffer.close()

        filename = f"System_Log_Report_{datetime.now().strftime('%Y%m%d')}.pdf"

        return HttpResponse(
            pdf,
            content_type='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )
        

class LatestSystemNotificationView(APIView):
    def get(self, request):
        latest = SystemHistory.objects.filter(deleted_at__isnull=True).order_by('-created_at').first()

        if latest:
            return Response({
                'type': latest.type,
                'data': latest.data,
                'created_at': latest.created_at,
            }, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'No notifications yet'}, status=status.HTTP_204_NO_CONTENT)