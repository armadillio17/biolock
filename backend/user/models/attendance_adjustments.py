from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from user.models.attendance import Attendance

User = get_user_model()

class AttendanceAdjustments(models.Model):
    ATTENDANCE_ADJUSTMENT_TYPE_CHOICES = [
        ('clock_in', 'Clock In Adjustment'),
        ('clock_out', 'Clock Out Adjustment'),
        ('overtime', 'Overtime Adjustment'),
        ('status', 'Status Change'),
    ]

    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name="adjustments")
    adjusted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="adjustments_made")

    adjustment_type = models.CharField(max_length=255, choices=ATTENDANCE_ADJUSTMENT_TYPE_CHOICES)
    adjustment_reason = models.TextField()
    old_value = models.JSONField()
    new_value = models.JSONField()

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
        return f"Adjustment #{self.id} for Attendance {self.attendance.id}"
