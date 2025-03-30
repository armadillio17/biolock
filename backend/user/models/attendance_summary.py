from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()

class AttendanceSummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")  
    period_start = models.DateField()
    period_end = models.DateField()
    total_working_hours = models.IntegerField(default=0)
    total_overtime_hours = models.IntegerField(default=0)
    total_leave_hours = models.IntegerField(default=0)
    total_absences = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self, *args, **kwargs):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the record is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return f"Attendance #{self.id} - {self.user}"
