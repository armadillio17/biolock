# views.py
from io import BytesIO
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from rest_framework.response import Response
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from user.models.report import Report
from user.models.users import CustomUser

class DownloadAttendancePDF(APIView):
    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            attendances = report.data  # This is your serialized attendance data
            
            # Create PDF buffer
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            
            # PDF content
            elements = []
            
            # 1. Title
            styles = getSampleStyleSheet()
            elements.append(Paragraph("Daily Attendance Report", styles['Title']))
            elements.append(Paragraph(f"Date: {report.created_at.date()}", styles['Normal']))
            elements.append(Paragraph(" " * 10, styles['Normal']))  # Spacer
            
            # 2. Table Data
            data = [["Employee", "Status", "Clock In", "Clock Out", "Working Hours", "Overtime"]]
            
            for attendance in attendances:
                user = CustomUser.objects.get(id=attendance['user']).get_full_name()
                data.append([
                    user,
                    attendance['status'],
                    attendance['clock_in'] or "-",
                    attendance['clock_out'] or "-",
                    attendance['working_hours'],
                    attendance['overtime_hours']
                ])
            
            # 3. Create Table
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(table)
            
            # Build PDF
            doc.build(elements)
            
            # Prepare response
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="attendance_report_{report.created_at.date()}.pdf"'
            return response
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)