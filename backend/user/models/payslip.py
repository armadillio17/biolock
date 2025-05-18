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
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payslip: {self.user} ({self.payroll_period})"
