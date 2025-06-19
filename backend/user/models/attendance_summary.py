from decimal import Decimal
from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from user.models.attendance import Attendance  # Adjust the import based on your project structure

User = get_user_model()

class AttendanceSummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_summaries", null=True, blank=True)
    attendance = models.ForeignKey(Attendance, on_delete=models.SET_NULL, null=True, blank=True, related_name='summary')
    date = models.DateField()

    total_working_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_overtime_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_leave_hours = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_absences = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "date")

    def delete(self, *args, **kwargs):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the record is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return f"Summary for {self.user} on {self.date}"
