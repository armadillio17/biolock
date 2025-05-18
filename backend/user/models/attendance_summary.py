from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()

class AttendanceSummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_summaries", null=True, blank=True)
    date = models.DateField()  # This is now a daily summary

    total_working_hours = models.FloatField(default=0.0)
    total_overtime_hours = models.FloatField(default=0.0)
    total_leave_hours = models.FloatField(default=0.0)
    total_absences = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "date")  # Ensure one summary per user per day

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
