from io import BytesIO
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, PageBreak, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from rest_framework.response import Response
from user.models.report import Report
from datetime import datetime, timedelta
from django.utils.timezone import localdate
from dateutil import parser
from collections import defaultdict
import traceback


class DownloadAttendancePDF(APIView):

    @staticmethod
    def format_datetime(dt_str):
        if dt_str:
            try:
                dt = parser.parse(dt_str)
                return dt.strftime('%m-%d-%y %I:%M %p')
            except Exception:
                return dt_str
        return "-"

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            attendances = report.data

            # 🔍 DEBUG: Let's see what the data looks like
            print("=== DEBUG INFO ===")
            print(f"Total attendance records: {len(attendances)}")
            if attendances:
                print(f"First attendance record: {attendances[0]}")
                print(f"Keys in first record: {list(attendances[0].keys())}")
                if 'user' in attendances[0]:
                    print(f"User data type: {type(attendances[0]['user'])}")
                    print(f"User data: {attendances[0]['user']}")

            # ✅ FIXED: Correctly group attendance by user full name
            user_attendance_map = defaultdict(list)
            for i, attendance in enumerate(attendances):
                try:
                    print(f"\n--- Processing record {i} ---")
                    user = attendance.get('user')
                    print(f"User data: {user}")
                    print(f"User type: {type(user)}")
                    
                    if user:
                        if isinstance(user, dict):
                            first_name = user.get('first_name', '')
                            last_name = user.get('last_name', '')
                            full_name = f"{last_name} {first_name}".strip()
                            print(f"Generated full_name: '{full_name}'")
                            print(f"Full name type: {type(full_name)}")
                            
                            if not full_name:
                                full_name = f"User_{user.get('id', i)}"
                                print(f"Using fallback name: '{full_name}'")
                            
                            user_attendance_map[full_name].append(attendance)
                            print(f"Successfully added to map with key: '{full_name}'")
                        else:
                            print(f"User is not a dict, it's: {type(user)}")
                            user_attendance_map[str(user)].append(attendance)
                    else:
                        print("No user data found")
                        user_attendance_map[f"Unknown_User_{i}"].append(attendance)
                        
                except Exception as e:
                    print(f"Error processing record {i}: {e}")
                    print(f"Problematic attendance: {attendance}")
                    traceback.print_exc()
                    raise e

            print(f"\n=== GROUPING RESULTS ===")
            print(f"Number of users: {len(user_attendance_map)}")
            for user_name, records in user_attendance_map.items():
                print(f"User: '{user_name}' ({type(user_name)}) has {len(records)} records")

            # Determine the full date range of the report
            all_report_dates = [parser.parse(r['date']).date() for r in attendances if 'date' in r]
            if all_report_dates:
                min_date = min(all_report_dates)
                max_date = max(all_report_dates)
            else:
                min_date = max_date = localdate()

            date_range = [(min_date + timedelta(days=i)) for i in range((max_date - min_date).days + 1)]
            date_coverage = f"{min_date.strftime('%m-%d-%y')} to {max_date.strftime('%m-%d-%y')}"

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            elements = []
            styles = getSampleStyleSheet()
            normal = styles["Normal"]
            bold = ParagraphStyle('Bold', parent=normal, fontName='Helvetica-Bold')
            section_label = ParagraphStyle('Label', parent=normal, fontName='Helvetica-Bold', textColor=colors.darkblue, fontSize=11)

            # ✅ UPDATED: Loop by full_name now instead of user_id
            for index, (full_name, records) in enumerate(user_attendance_map.items()):
                print(f"\n--- Generating PDF for user: '{full_name}' ---")
                
                # ⛔ REMOVED: CustomUser.objects.get() — we use attendance data directly now
                # Simulated dummy values (could be added to attendance later)
                position_name = "-"
                department_name = "-"

                total_days = len(records)
                total_absences = sum(1 for r in records if r.get('status') == 'Absent')
                total_lates = sum(1 for r in records if r.get('status') == 'Late')
                total_working_hours = sum(float(r.get('working_hours', 0) or 0) for r in records)
                total_overtime_hours = sum(float(r.get('overtime_hours', 0) or 0) for r in records)

                # Header
                elements.append(Paragraph("Attendance Report", styles['Title']))
                elements.append(Spacer(1, 12))
                elements.append(Paragraph(f"Generated on: {report.created_at.strftime('%m-%d-%y')}", normal))
                elements.append(Paragraph(f"Date Coverage: {date_coverage}", normal))
                elements.append(Spacer(1, 6))

                # User Info Table
                user_info_data = [
                    [Paragraph("<b>Name:</b>", section_label), full_name,
                     Paragraph("<b>Position:</b>", section_label), position_name],

                    [Paragraph("<b>Total Hours:</b>", section_label), f"{total_working_hours:.2f} hrs",
                     Paragraph("<b>Overtime Hours:</b>", section_label), f"{total_overtime_hours:.2f} hrs"],

                    [Paragraph("<b>Total Days:</b>", section_label), str(total_days),
                     Paragraph("<b>Total Absences:</b>", section_label), str(total_absences)],

                    [Paragraph("<b>Total Lates:</b>", section_label), str(total_lates), '', '']
                ]

                user_info_table = Table(user_info_data, hAlign='LEFT', colWidths=[100, 150, 100, 150])
                user_info_table.setStyle(TableStyle([
                    ('BOX', (0, 0), (-1, -1), 1, colors.lightgrey),
                    ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ('BACKGROUND', (0, 0), (-1, -1), colors.whitesmoke),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ]))
                elements.append(user_info_table)
                elements.append(Spacer(1, 20))

                # Attendance Table
                records_by_date = {
                    parser.parse(r['date']).date(): r for r in records if 'date' in r
                }

                attendance_data = [["Date", "Status", "Clock In", "Clock Out", "Working Hours", "Overtime"]]
                for current_date in date_range:
                    record = records_by_date.get(current_date)
                    if record:
                        attendance_data.append([
                            current_date.strftime('%m-%d-%y'),
                            record.get('status', '-'),
                            self.format_datetime(record.get('clock_in')),
                            self.format_datetime(record.get('clock_out')),
                            record.get('working_hours', '-'),
                            record.get('overtime_hours', '-')
                        ])
                    else:
                        attendance_data.append([
                            current_date.strftime('%m-%d-%y'),
                            '-', '-', '-', '-', '-'
                        ])

                table = Table(attendance_data, hAlign='CENTER', colWidths=[80, 80, 100, 100, 80, 80])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E86C1')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ('TOPPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(table)

                if index < len(user_attendance_map) - 1:
                    elements.append(PageBreak())

            print("=== Building PDF ===")
            doc.build(elements)
            buffer.seek(0)

            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="attendance_report_{report.created_at.date()}.pdf"'
            return response

        except Exception as e:
            print("Error generating PDF:", str(e))
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)