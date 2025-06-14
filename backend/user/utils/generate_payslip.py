from django.db.models import Sum
from user.models import UserSalary, Payslip, PayrollPeriod
from .payslip_calculations import PayslipCalculator

def generate_payslip(user, payroll_period):
    # Get basic data
    salary = UserSalary.objects.get(user=user)
    hours_data = PayslipCalculator.calculate_working_hours(user, payroll_period)
    
    # Calculate amounts
    gross_pay = PayslipCalculator.calculate_gross_pay(salary, payroll_period, hours_data)
    benefits = PayslipCalculator.calculate_benefits(user, gross_pay)
    absence_deductions = PayslipCalculator.calculate_absence_deductions(hours_data['absences'])
    
    # Sum employee contributions for total deductions
    employee_contributions = sum(
        benefits[benefit]['employee'] 
        for benefit in benefits
    )
    total_deductions = absence_deductions + employee_contributions
    
    # Create payslip
    payslip = Payslip.objects.create(
        user=user,
        payroll_period=payroll_period,
        total_working_hours=hours_data['working_hours'],
        total_overtime_hours=hours_data['overtime_hours'],
        total_leave_hours=hours_data['leave_hours'],
        total_absences=hours_data['absences'],
        gross_pay=gross_pay,
        deductions=total_deductions,
        net_pay=gross_pay - total_deductions,
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