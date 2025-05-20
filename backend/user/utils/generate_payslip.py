from django.db.models import Sum
from decimal import Decimal
from user.models import UserSalary, AttendanceSummary, Payslip, PayrollPeriod

def generate_payslip(user, payroll_period):
    # Get user's salary info
    salary = UserSalary.objects.get(user=user)
    
    # Get attendance summaries within the payroll period
    summaries = AttendanceSummary.objects.filter(
        user=user,
        date__range=(payroll_period.start_date, payroll_period.end_date)
    )

    total_hours = summaries.aggregate(Sum('total_working_hours'))['total_working_hours__sum'] or 0
    total_overtime = summaries.aggregate(Sum('total_overtime_hours'))['total_overtime_hours__sum'] or 0
    total_leaves = summaries.aggregate(Sum('total_leave_hours'))['total_leave_hours__sum'] or 0
    total_absences = summaries.aggregate(Sum('total_absences'))['total_absences__sum'] or 0

    # Salary calculation
    if salary.salary_type == "hourly":
        hourly_rate = salary.amount
        gross_pay = (Decimal(total_hours) + Decimal(total_overtime)) * hourly_rate
    elif salary.salary_type == "monthly":
        working_days = summaries.count()
        total_work_hours_standard = working_days * 8
        hourly_rate = salary.amount / Decimal(total_work_hours_standard) if total_work_hours_standard else 0
        gross_pay = (Decimal(total_hours) + Decimal(total_overtime)) * hourly_rate
    else:
        raise ValueError("Unsupported salary type")

    # Deductions example: 100 per absence
    deductions = Decimal(total_absences) * Decimal(100)
    net_pay = gross_pay - deductions

    # Create payslip
    payslip = Payslip.objects.create(
        user=user,
        payroll_period=payroll_period,
        total_working_hours=total_hours,
        total_overtime_hours=total_overtime,
        total_leave_hours=total_leaves,
        total_absences=total_absences,
        gross_pay=gross_pay,
        deductions=deductions,
        net_pay=net_pay
    )

    # Update the payroll period's total amount
    update_payroll_period_total(payroll_period)

    return payslip

def update_payroll_period_total(payroll_period):
    """
    Update the total_amount for a payroll period by summing all net_pay values
    from associated payslips
    """
    total = Payslip.objects.filter(
        payroll_period=payroll_period
    ).aggregate(
        total_amount=Sum('net_pay')
    )['total_amount'] or 0
    
    PayrollPeriod.objects.filter(id=payroll_period.id).update(total_amount=total)