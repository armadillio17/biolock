from io import BytesIO from rest_framework.views import APIView from django.http import HttpResponse from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, PageBreak, Spacer from reportlab.lib.pagesizes import A4 from reportlab.lib.styles import getSampleStyleSheet, Paragrap

pasted

in my aws ec2 I get an error TypeError: unhashable type: 'dict'

Edit
Looking at your code, the error "TypeError: unhashable type: 'dict'" is most likely occurring in this line:

python
user_attendance_map[attendance['user']].append(attendance)
The issue is that attendance['user'] is probably a dictionary object rather than a simple value like an integer or string. In Python, you can't use dictionaries as dictionary keys because they're not hashable.

Here are the most common solutions:

Solution 1: Use user ID if it's nested in the user dict
python
# Replace this line:
user_attendance_map[attendance['user']].append(attendance)

# With this:
user_id = attendance['user']['id'] if isinstance(attendance['user'], dict) else attendance['user']
user_attendance_map[user_id].append(attendance)
Solution 2: Convert dict to string (if user data is simple)
python
# Replace this line:
user_attendance_map[attendance['user']].append(attendance)

# With this:
user_key = str(attendance['user']) if isinstance(attendance['user'], dict) else attendance['user']
user_attendance_map[user_key].append(attendance)
Solution 3: More robust approach with debugging

Fixed DownloadAttendancePDF with error handling
Code 
Quick Debug Steps
To identify exactly what's happening, add this debug code right after getting the attendances:

python
# Add this after: attendances = report.data
print("Sample attendance record:")
if attendances:
    print(f"Type of attendance['user']: {type(attendances[0]['user'])}")
    print(f"Content of attendance['user']: {attendances[0]['user']}")
This will help you see exactly what format your user data is in.

Most likely scenarios:
User is a nested dict: attendance['user'] contains {'id': 123, 'name': 'John', ...}
User is a serialized object: The user field contains a full user object serialized as a dict
Data structure changed: The data format might have changed between when it was saved and now
The fixed code above handles these cases more robustly. The key changes are:

Added a get_user_key() method to safely extract a hashable key from user data
Added better error handling to identify which record is causing the issue
Made the user lookup more flexible to handle different data formats
Try the fixed version and let me know if you still get errors!






from io import BytesIO from rest_framework.views import APIView from django.http import HttpResponse from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, PageBreak, Spacer from reportlab.lib.pagesizes import A4 from reportlab.lib.styles import getSampleStyleSheet, Paragrap

pasted

sorry this is the updated code

Edit
I see you've fixed the main issue by using the user's full name as the key instead of the user dictionary object. That's a good solution! However, I notice a few potential improvements and edge cases that could still cause issues:


Improved DownloadAttendancePDF with better error handling
Code 
Key improvements in the updated code:
1. Robust User Name Extraction
Added get_user_full_name() method that handles various user data structures
Fallbacks for missing names (uses ID, email, or "Unknown User")
Handles edge cases where user data might be malformed
2. Better Error Handling
Validates that attendance data exists before processing
Skips problematic records instead of crashing
Logs warnings for skipped records
Handles missing or invalid dates gracefully
3. Safer Numeric Calculations
Protected float conversions for working hours and overtime
Won't crash if hours are stored as strings or are null
4. Enhanced Data Validation
Checks for empty user data
Handles nested objects for position and department
Validates date parsing before using dates
5. More Informative Error Messages
Specific error responses for different failure scenarios
Better logging for debugging
Common issues this addresses:
Empty user objects: Won't crash if user is None or empty
Malformed dates: Skips invalid dates instead of crashing
Missing numeric fields: Handles null/empty working hours gracefully
Inconsistent data structures: Adapts to different user data formats
Duplicate names: Groups by full name correctly even with edge cases
Your original fix was good - using the full name as the key instead of the dict object. This improved version just makes it much more robust against real-world data inconsistencies that often happen in production systems.







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

    def get_user_full_name(self, user_data):
        """Safely extract full name from user data with fallbacks"""
        if not user_data:
            return "Unknown User"
        
        try:
            # Handle different possible user data structures
            if isinstance(user_data, dict):
                first_name = user_data.get('first_name', '').strip()
                last_name = user_data.get('last_name', '').strip()
                
                # Try different name field combinations
                if first_name or last_name:
                    full_name = f"{last_name} {first_name}".strip()
                elif user_data.get('full_name'):
                    full_name = user_data.get('full_name').strip()
                elif user_data.get('name'):
                    full_name = user_data.get('name').strip()
                else:
                    # Use user ID or email as fallback
                    full_name = str(user_data.get('id', user_data.get('email', 'Unknown User')))
                
                return full_name if full_name else "Unknown User"
            else:
                # If user_data is not a dict, convert to string
                return str(user_data)
        except Exception as e:
            print(f"Error extracting user name from {user_data}: {e}")
            return "Unknown User"

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
            attendances = report.data

            # Validate that we have attendance data
            if not attendances:
                return Response({"error": "No attendance data found in report"}, status=404)

            # Group attendance by user full name with better error handling
            user_attendance_map = defaultdict(list)
            skipped_records = 0
            
            for i, attendance in enumerate(attendances):
                try:
                    user = attendance.get('user')
                    if not user:
                        print(f"Warning: No user data in attendance record {i}")
                        skipped_records += 1
                        continue
                    
                    full_name = self.get_user_full_name(user)
                    user_attendance_map[full_name].append(attendance)
                    
                except Exception as e:
                    print(f"Error processing attendance record {i}: {e}")
                    print(f"Problematic record: {attendance}")
                    skipped_records += 1
                    continue

            if skipped_records > 0:
                print(f"Warning: Skipped {skipped_records} attendance records due to missing/invalid user data")

            if not user_attendance_map:
                return Response({"error": "No valid attendance records found"}, status=404)

            # Determine the full date range of the report
            all_report_dates = []
            for r in attendances:
                if 'date' in r and r['date']:
                    try:
                        date_obj = parser.parse(r['date']).date()
                        all_report_dates.append(date_obj)
                    except Exception as e:
                        print(f"Error parsing date {r['date']}: {e}")
                        continue

            if all_report_dates:
                min_date = min(all_report_dates)
                max_date = max(all_report_dates)
            else:
                min_date = max_date = datetime.today().date()

            date_range = [(min_date + timedelta(days=i)) for i in range((max_date - min_date).days + 1)]
            date_coverage = f"{min_date.strftime('%m-%d-%y')} to {max_date.strftime('%m-%d-%y')}"

            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            elements = []
            styles = getSampleStyleSheet()
            normal = styles["Normal"]
            bold = ParagraphStyle('Bold', parent=normal, fontName='Helvetica-Bold')
            section_label = ParagraphStyle('Label', parent=normal, fontName='Helvetica-Bold', textColor=colors.darkblue, fontSize=11)

            # Process each user's attendance
            for index, (full_name, records) in enumerate(user_attendance_map.items()):
                # Get additional user info from first record if available
                first_record = records[0] if records else {}
                user_data = first_record.get('user', {})
                
                # Try to get position and department from user data
                position_name = "-"
                department_name = "-"
                
                if isinstance(user_data, dict):
                    position_name = user_data.get('position', user_data.get('position_name', '-'))
                    department_name = user_data.get('department', user_data.get('department_name', '-'))
                    
                    # Handle nested objects
                    if isinstance(position_name, dict):
                        position_name = position_name.get('name', '-')
                    if isinstance(department_name, dict):
                        department_name = department_name.get('name', '-')

                # Calculate totals with better error handling
                total_days = len(records)
                total_absences = 0
                total_lates = 0
                total_working_hours = 0
                total_overtime_hours = 0
                
                for r in records:
                    if r.get('status') == 'Absent':
                        total_absences += 1
                    elif r.get('status') == 'Late':
                        total_lates += 1
                    
                    # Handle working hours safely
                    try:
                        working_hrs = r.get('working_hours', 0)
                        if working_hrs:
                            total_working_hours += float(working_hrs)
                    except (ValueError, TypeError):
                        pass
                    
                    # Handle overtime hours safely
                    try:
                        overtime_hrs = r.get('overtime_hours', 0)
                        if overtime_hrs:
                            total_overtime_hours += float(overtime_hrs)
                    except (ValueError, TypeError):
                        pass

                # Header
                elements.append(Paragraph("Attendance Report", styles['Title']))
                elements.append(Spacer(1, 12))
                elements.append(Paragraph(f"Generated on: {report.created_at.strftime('%m-%d-%y')}", normal))
                elements.append(Paragraph(f"Date Coverage: {date_coverage}", normal))
                elements.append(Spacer(1, 6))

                # User Info Table
                user_info_data = [
                    [Paragraph("<b>Name:</b>", section_label), full_name,
                     Paragraph("<b>Position:</b>", section_label), str(position_name)],

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

                # Attendance Table with better date handling
                records_by_date = {}
                for r in records:
                    if 'date' in r and r['date']:
                        try:
                            date_key = parser.parse(r['date']).date()
                            records_by_date[date_key] = r
                        except Exception as e:
                            print(f"Error parsing date {r['date']} for user {full_name}: {e}")

                attendance_data = [["Date", "Status", "Clock In", "Clock Out", "Working Hours", "Overtime"]]
                for current_date in date_range:
                    record = records_by_date.get(current_date)
                    if record:
                        # Format working hours and overtime hours
                        working_hours = record.get('working_hours', '-')
                        overtime_hours = record.get('overtime_hours', '-')
                        
                        if working_hours and working_hours != '-':
                            try:
                                working_hours = f"{float(working_hours):.2f}"
                            except (ValueError, TypeError):
                                working_hours = str(working_hours)
                        
                        if overtime_hours and overtime_hours != '-':
                            try:
                                overtime_hours = f"{float(overtime_hours):.2f}"
                            except (ValueError, TypeError):
                                overtime_hours = str(overtime_hours)
                        
                        attendance_data.append([
                            current_date.strftime('%m-%d-%y'),
                            record.get('status', '-'),
                            self.format_datetime(record.get('clock_in')),
                            self.format_datetime(record.get('clock_out')),
                            working_hours,
                            overtime_hours
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

            doc.build(elements)
            buffer.seek(0)

            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="attendance_report_{report.created_at.date()}.pdf"'
            return response

        except Report.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)
        except Exception as e:
            print("Error generating PDF:", str(e))
            traceback.print_exc()
            return Response({"error": f"Failed to generate PDF: {str(e)}"}, status=500)