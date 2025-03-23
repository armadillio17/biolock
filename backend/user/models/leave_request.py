from django.db import models
from django.utils.timezone import now
from user.models.attendance import Attendance

class LeaveRequest(models.Model):
    attendance_id = models.ForeignKey(Attendance, on_delete=models.CASCADE)
    date = models.DateField()
    type = models.CharField(max_length=255)
    details = models.TextField()
    status = models.enums.EnumField(choices=['pending', 'approved', 'rejected'], default='pending')
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
        return f"Leave Request #{self.id}"