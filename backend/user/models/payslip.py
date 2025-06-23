from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from user.models.payroll_period import PayrollPeriod

User = get_user_model()

class Payslip(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payslips", null=True, blank=True
    )
    payroll_period = models.ForeignKey(
        PayrollPeriod, on_delete=models.CASCADE, related_name="payslips"
    )

    total_working_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_overtime_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_leave_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_absences = models.IntegerField(default=0)
    total_overtime_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_holidays_worked = models.PositiveIntegerField(default=0)
    total_holiday_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Employee contributions
    sss_employee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="SSS (Employee Share)"
    )
    philhealth_employee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="PhilHealth (Employee Share)"
    )
    pagibig_employee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="Pag-IBIG (Employee Share)"
    )
    
    # Employer contributions
    sss_employer = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="SSS (Employer Share)"
    )
    philhealth_employer = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="PhilHealth (Employer Share)"
    )
    pagibig_employer = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name="Pag-IBIG (Employer Share)"
    )
    
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'payroll_period')

