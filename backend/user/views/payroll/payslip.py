from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import PayrollPeriod, CustomUser, Payslip
from user.serializers import PayslipSerializer
from user.utils.generate_payslip import generate_payslip
from django.http import HttpResponse, Http404
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from datetime import datetime
from django.utils.timezone import localtime
from user.utils.system_history import log_notification
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class PayslipView(APIView):
    def post(self, request, *args, **kwargs):
        """
        Endpoint to generate a payslip for a user based on payroll period
        """
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        if not start_date or not end_date:
            return Response({"error": "Missing required fields: start_date, end_date"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payroll_period, _ = PayrollPeriod.objects.get_or_create(
                start_date=start_date,
                end_date=end_date,
                defaults={'is_processed': False}
            )

            if payroll_period.is_processed:
                return Response(
                    {"error": "Payslips already generated for this period"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            users = CustomUser.objects.filter(
                attendance_summaries__date__range=[start_date, end_date]
            ).distinct()

            payslips = []
            for user in users:
                payslip = generate_payslip(user, payroll_period)
                payslips.append(payslip)

            payroll_period.is_processed = True
            payroll_period.save()

            log_notification(
                user_id=request.user.id,  # Use the ID of the logged-in user
                notification_type="Generate Payslip",
                data={
                    "status": "Completed",
                    "details": "Generated payslips for the period",
                }
            )

            serializer = PayslipSerializer(payslips, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except PayrollPeriod.DoesNotExist:
            return Response({"error": "Payroll period not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        """
        Endpoint to list all generated payslips for a user or for a specific payroll period.
        """
        user_id = request.query_params.get('user_id', None)
        payroll_period_id = request.query_params.get('payroll_period_id', None)

        # Filtering payslips based on user and payroll period
        if user_id and payroll_period_id:
            payslips = Payslip.objects.filter(user_id=user_id, payroll_period_id=payroll_period_id)
        elif user_id:
            payslips = Payslip.objects.filter(user_id=user_id)
        elif payroll_period_id:
            payslips = Payslip.objects.filter(payroll_period_id=payroll_period_id)
        else:
            payslips = Payslip.objects.all()

        # Serialize payslips
        serializer = PayslipSerializer(payslips, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def download_payslips_pdf(request, payroll_period_id):
        try:
            # Validate input
            if not payroll_period_id or not str(payroll_period_id).isdigit():
                raise ValueError("Invalid payroll period ID")

            # Get payslips
            payslips = Payslip.objects.filter(
                payroll_period_id=payroll_period_id
            ).select_related('user', 'payroll_period')

            if not payslips.exists():
                raise Http404(f"No payslips found for period {payroll_period_id}")

            # Create buffer and PDF canvas
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []

            # Header styling
            styles = getSampleStyleSheet()
            header_style = styles["Heading1"]
            header_style.fontSize = 14

            # Company details
            company_name = "TechCorp Solutions Inc."
            company_address = "123 Business District, Makati City, Metro Manila 1200"
            company_contact = "+63 2 8133 4567 | hr@techcorp.com.ph"

            # Generate PDF content for each payslip
            for payslip in payslips:
                employee = payslip.user
                period = payslip.payroll_period

                # Employee info
                employee_name = employee.get_full_name()
                employee_id = f"TS-{period.id}-{employee.id:03d}"
                employee_position = employee.position
                employee_department = employee.department
                employee_email = employee.email

                # Period info
                start_date = period.start_date.strftime('%Y-%m-%d')
                end_date = period.end_date.strftime('%Y-%m-%d')

                # Time summary data
                time_summary_data = [
                    ["Working Hours", "Overtime Hours", "Leave Hours", "Absences"],
                    [str(payslip.total_working_hours or 0),
                    str(payslip.total_overtime_hours or 0),
                    str(payslip.total_leave_hours or 0),
                    str(payslip.total_absences or 0)],
                ]

                # Earnings data
                earnings_data = [
                    ["Basic Salary", f"₱{payslip.basic_salary or 0:.2f}"],
                    ["Overtime Pay", f"₱{payslip.total_overtime_pay or 0:.2f}"],
                    ["Gross Pay", f"₱{payslip.gross_pay or 0:.2f}"],
                ]

                # Deductions data
                employee_deductions_data = [
                    ["SSS", f"₱{payslip.sss_employee or 0:.2f}"],
                    ["PhilHealth", f"₱{payslip.philhealth_employee or 0:.2f}"],
                    ["Pag-IBIG", f"₱{payslip.pagibig_employee or 0:.2f}"],
                    ["Total Deductions", f"₱{payslip.deductions or 0:.2f}"],
                ]

                # Employer contributions
                employer_contributions_data = [
                    ["SSS", f"₱{payslip.sss_employer or 0:.2f}"],
                    ["PhilHealth", f"₱{payslip.philhealth_employer or 0:.2f}"],
                    ["Pag-IBIG", f"₱{payslip.pagibig_employer or 0:.2f}"],
                    # ["Total Contributions", f"₱{payslip.employer_contributions or 0:.2f}"],
                ]

                # Add company header
                elements.append(Paragraph(company_name, header_style))
                elements.append(Spacer(1, 12))
                elements.append(Paragraph(company_address, styles["Normal"]))
                elements.append(Paragraph(company_contact, styles["Normal"]))
                elements.append(Spacer(1, 24))

                # Add payslip title
                elements.append(Paragraph(f"Payslip - Period {period.id}", header_style))
                elements.append(Spacer(1, 12))

                # Add employee information table
                employee_info_data = [
                    ["Name", employee_name],
                    ["Employee ID", employee_id],
                    ["Position", str(employee_position)],
                    ["Department", str(employee_department)],
                    ["Email", employee_email],
                ]
                employee_info_table = Table(employee_info_data, colWidths=[1.5 * inch, 3.5 * inch])
                employee_info_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(employee_info_table)
                elements.append(Spacer(1, 12))

                # Add time summary table
                time_summary_table = Table(time_summary_data, colWidths=[1.5 * inch] * 4)
                time_summary_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(Paragraph("Time Summary", styles["Heading2"]))
                elements.append(time_summary_table)
                elements.append(Spacer(1, 12))

                # Add earnings table
                earnings_table = Table(earnings_data, colWidths=[2.5 * inch, 2.5 * inch])
                earnings_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.lightgreen),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(Paragraph("Earnings", styles["Heading2"]))
                elements.append(earnings_table)
                elements.append(Spacer(1, 12))

                # Add employee deductions table
                employee_deductions_table = Table(employee_deductions_data, colWidths=[2.5 * inch, 2.5 * inch])
                employee_deductions_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.lightyellow),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                    ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                elements.append(Paragraph("Deductions", styles["Heading2"]))
                elements.append(employee_deductions_table)
                elements.append(Spacer(1, 12))

                # Add net pay section
                net_pay_paragraph = Paragraph(
                    f"<font size=14><b>Net Pay:</b></font> <font size=14><b>₱{payslip.net_pay or 0:.2f}</b></font>",
                    styles["Normal"]
                )
                net_pay_paragraph.style.backColor = colors.green
                elements.append(net_pay_paragraph)
                elements.append(Spacer(1, 24))

                # Add footer
                footer_text = f"Generated on: {localtime().strftime('%Y-%m-%d %H:%M')}"
                elements.append(Paragraph(footer_text, styles["Normal"]))
                elements.append(Spacer(1, 12))

                # Page break after each payslip
                elements.append(PageBreak())

            # Build the PDF
            doc.build(elements)

            # Prepare response
            buffer.seek(0)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="payslips_{payroll_period_id}.pdf"'
            return response

        except Exception as e:
            import traceback
            traceback.print_exc()
            return HttpResponse(
                f"Error generating PDF: {str(e)}",
                status=500,
                content_type='text/plain'
            )