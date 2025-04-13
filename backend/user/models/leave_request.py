from django.db import models
from django.utils.timezone import now
from user.models.attendance import Attendance
from django.contrib.auth import get_user_model  # To handle custom user models

User = get_user_model()

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('declined', 'Declined'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='leave_requests',
        null=True,
        blank=True
    )
    attendance_id = models.ForeignKey(
        Attendance, 
        on_delete=models.CASCADE, 
        null=True,
        blank=True
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField()
    type = models.CharField(max_length=255)
    details = models.TextField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self, *args, **kwargs):
        self.deleted_at = now()
        self.save()

    def is_deleted(self):
        return self.deleted_at is not None

    def __str__(self):
        return f"Leave Request #{self.id} for {self.user}"

