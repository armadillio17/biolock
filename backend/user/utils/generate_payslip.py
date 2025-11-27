from django.db.models import Sum
from user.models import UserSalary, Payslip, PayrollPeriod
from .payslip_calculations import PayslipCalculator

def generate_payslip(user, payroll_period):
    try:
        salary = UserSalary.objects.get(user=user)
    except UserSalary.DoesNotExist:
        print(f"Skipping payslip generation for {user.username}: No salary record found.")
        return None  # or return early instead of raising an error

    print(f"Generating payslip for {user.username} for period {payroll_period.start_date} to {payroll_period.end_date}")

    hours_data = PayslipCalculator.calculate_working_hours(user, payroll_period)

    gross_pay_details = PayslipCalculator.calculate_gross_pay(salary, payroll_period, hours_data)
    benefits = PayslipCalculator.calculate_benefits(user, gross_pay_details['gross_pay'])
    absence_deductions = PayslipCalculator.calculate_absence_deductions(hours_data['absences'])

    employee_contributions = sum(benefits[benefit]['employee'] for benefit in benefits)
    total_deductions = absence_deductions + employee_contributions
    print(f"Total deductions for {user.username}: {total_deductions}")

    payslip = Payslip.objects.create(
        user=user,
        payroll_period=payroll_period,
        total_working_hours=hours_data['working_hours'],
        total_overtime_hours=hours_data['overtime_hours'],
        total_leave_hours=hours_data['leave_hours'],
        total_absences=hours_data['absences'],

        # Pay components
        basic_salary= gross_pay_details['regular_pay'],
        gross_pay=gross_pay_details['gross_pay'],
        deductions=total_deductions,
        net_pay=gross_pay_details['gross_pay'] - total_deductions,

        # Overtime & Holiday Info
        total_overtime_pay=gross_pay_details['overtime_pay'],
        total_holidays_worked=hours_data['holidays_worked'],
        total_holiday_pay=gross_pay_details['holiday_pay'],

        # Employee contributions
        sss_employee=benefits['sss']['employee'],
        philhealth_employee=benefits['philhealth']['employee'],
        pagibig_employee=benefits['pagibig']['employee'],

        # Employer contributions
        sss_employer=benefits['sss']['employer'],
        philhealth_employer=benefits['philhealth']['employer'],
        pagibig_employer=benefits['pagibig']['employer']
    )

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