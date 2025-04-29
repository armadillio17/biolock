from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from user.models.holiday import Holiday

User = get_user_model()

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('working', 'Working'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('half_day', 'Half Day'),
        ('on_leave', 'Leave'),
        ('on_break', 'Break'),
        ('day_off', 'Day Off'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances") 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances") 
    holiday = models.ForeignKey(Holiday, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendances") 

    date = models.DateField()
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    working_hours = models.IntegerField(default=0)
    overtime_hours = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
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
