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
            
            # Get payslips with error handling
            payslips = Payslip.objects.filter(
                payroll_period_id=payroll_period_id
            ).select_related('user', 'payroll_period')
            
            if not payslips.exists():
                raise Http404(f"No payslips found for period {payroll_period_id}")
            
            # Create buffer and PDF canvas
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Set metadata
            p.setTitle(f"Payslips - Period {payroll_period_id}")
            
            # Header styling
            p.setFont("Helvetica-Bold", 12)
            p.drawString(1 * inch, 10.5 * inch, f"Payslips for Period ID: {payroll_period_id}")
            p.drawString(4 * inch, 10.5 * inch, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
            p.setFont("Helvetica", 10)
            
            y_position = 10 * inch
            
            for payslip in payslips:
                # Check if we need a new page
                if y_position < 2 * inch:  # Increased minimum space for more content
                    p.showPage()
                    y_position = 10 * inch
                    p.setFont("Helvetica", 10)
                
                # Employee info
                p.setFont("Helvetica-Bold", 11)
                p.drawString(1 * inch, y_position, f"Employee: {payslip.user.get_full_name()}")
                y_position -= 0.3 * inch
                
                # Period info
                p.setFont("Helvetica", 10)
                start_date = payslip.payroll_period.start_date.strftime('%Y-%m-%d')
                end_date = payslip.payroll_period.end_date.strftime('%Y-%m-%d')
                p.drawString(1 * inch, y_position, f"Period: {start_date} to {end_date}")
                y_position -= 0.3 * inch
                
                # Hours breakdown
                p.drawString(1 * inch, y_position, f"Working Hours: {payslip.total_working_hours or 0}")
                y_position -= 0.25 * inch
                p.drawString(1 * inch, y_position, f"Overtime Hours: {payslip.total_overtime_hours or 0}")
                y_position -= 0.25 * inch
                p.drawString(1 * inch, y_position, f"Leave Hours: {payslip.total_leave_hours or 0}")
                y_position -= 0.25 * inch
                p.drawString(1 * inch, y_position, f"Absences: {payslip.total_absences or 0}")
                y_position -= 0.3 * inch
                
                # Payment info - Gross Pay first
                p.setFont("Helvetica-Bold", 10)
                p.drawString(1 * inch, y_position, f"Gross Pay: ₱{payslip.gross_pay or 0:.2f}")
                y_position -= 0.3 * inch
                
                # Employee Deductions header
                p.setFont("Helvetica-Bold", 10)
                p.drawString(1 * inch, y_position, "Employee Deductions:")
                y_position -= 0.25 * inch
                
                # Employee contributions
                p.setFont("Helvetica", 9)
                p.drawString(1.2 * inch, y_position, f"SSS: ₱{payslip.sss_employee or 0:.2f}")
                y_position -= 0.2 * inch
                p.drawString(1.2 * inch, y_position, f"PhilHealth: ₱{payslip.philhealth_employee or 0:.2f}")
                y_position -= 0.2 * inch
                p.drawString(1.2 * inch, y_position, f"Pag-IBIG: ₱{payslip.pagibig_employee or 0:.2f}")
                y_position -= 0.2 * inch
                
                # Other deductions (assuming these fields exist)
                if hasattr(payslip, 'tax'):
                    p.drawString(1.2 * inch, y_position, f"Tax: ₱{payslip.tax or 0:.2f}")
                    y_position -= 0.2 * inch
                if hasattr(payslip, 'other_deductions'):
                    p.drawString(1.2 * inch, y_position, f"Other Deductions: ₱{payslip.other_deductions or 0:.2f}")
                    y_position -= 0.3 * inch
                
                # Total employee deductions
                p.setFont("Helvetica-Bold", 10)
                p.drawString(1 * inch, y_position, f"Total Employee Deductions: ₱{payslip.deductions or 0:.2f}")
                y_position -= 0.3 * inch
                
                # Employer contributions section
                p.setFont("Helvetica-Bold", 10)
                p.drawString(1 * inch, y_position, "Employer Contributions:")
                y_position -= 0.25 * inch
                
                p.setFont("Helvetica", 9)
                p.drawString(1.2 * inch, y_position, f"SSS: ₱{payslip.sss_employer or 0:.2f}")
                y_position -= 0.2 * inch
                p.drawString(1.2 * inch, y_position, f"PhilHealth: ₱{payslip.philhealth_employer or 0:.2f}")
                y_position -= 0.2 * inch
                p.drawString(1.2 * inch, y_position, f"Pag-IBIG: ₱{payslip.pagibig_employer or 0:.2f}")
                y_position -= 0.3 * inch
                
                # Total employer contributions
                p.setFont("Helvetica-Bold", 10)
                p.drawString(1 * inch, y_position, f"Total Employer Contributions: ₱{payslip.employer_contributions or 0:.2f}")
                y_position -= 0.3 * inch
                
                # Net Pay
                p.setFont("Helvetica-Bold", 11)
                p.drawString(1 * inch, y_position, f"Net Pay: ₱{payslip.net_pay or 0:.2f}")
                y_position -= 0.5 * inch
                
                # Add separator line
                p.line(0.5 * inch, y_position + 0.25 * inch, 7.5 * inch, y_position + 0.25 * inch)
                y_position -= 0.5 * inch
            
            # Finalize PDF
            p.showPage()
            p.save()
            
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