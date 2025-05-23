from django.db import models
from django.contrib.auth import get_user_model
from user.models.payroll_period import PayrollPeriod

User = get_user_model()

class Payslip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payslips", null=True, blank=True)
    payroll_period = models.ForeignKey(PayrollPeriod, on_delete=models.CASCADE, related_name="payslips")

    total_working_hours = models.IntegerField(default=0)
    total_overtime_hours = models.IntegerField(default=0)
    total_leave_hours = models.IntegerField(default=0)
    total_absences = models.IntegerField(default=0)

    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Government contributions - Employee Share
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
    
    # Government contributions - Employer Share
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

    def __str__(self):
        return f"Payslip: {self.user} ({self.payroll_period})"

    @property
    def total_government_contributions(self):
        """Calculate total of all government contributions (both employee and employer)"""
        return sum([
            self.sss_employee,
            self.philhealth_employee,
            self.pagibig_employee,
            self.sss_employer,
            self.philhealth_employer,
            self.pagibig_employer
        ])

    @property
    def employee_contributions(self):
        """Calculate total employee contributions only"""
        return sum([
            self.sss_employee,
            self.philhealth_employee,
            self.pagibig_employee
        ])

    @property
    def employer_contributions(self):
        """Calculate total employer contributions only"""
        return sum([
            self.sss_employer,
            self.philhealth_employer,
            self.pagibig_employer
        ])

    class Meta:
        verbose_name = "Payslip"
        verbose_name_plural = "Payslips"
        unique_together = ('user', 'payroll_period')  # Prevent duplicate payslips

