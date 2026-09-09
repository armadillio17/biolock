from django.conf import settings
from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model
from user.models.holiday.holiday import Holiday
from user.models.holiday.custom_holiday import CustomHoliday

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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances", null=True, blank=True) 
    holiday = models.ForeignKey(Holiday, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendances") 
    custom_holiday = models.ForeignKey(CustomHoliday, on_delete=models.SET_NULL, null=True, blank=True, related_name="attendance_records")

    date = models.DateField()
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    working_hours = models.FloatField(default=0.0)
    overtime_hours = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    scheduled_start = models.DateTimeField(null=True, blank=True)
    scheduled_end = models.DateTimeField(null=True, blank=True)
    is_clockOut = models.BooleanField(default=False)
    clock_in_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_in_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_in_location = models.ForeignKey(
        "user.Location", on_delete=models.SET_NULL, null=True, blank=True, related_name="clock_ins"
    )
    clock_out_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_out_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    clock_out_location = models.ForeignKey(
        "user.Location", on_delete=models.SET_NULL, null=True, blank=True, related_name="clock_outs"
    )
    # A punch from outside every active work location is allowed -- staff run
    # errands for the office -- but the user must say why, and we keep the
    # stated reason next to the coordinates so an admin can review the claim.
    is_clock_in_outside = models.BooleanField(default=False)
    clock_in_outside_reason = models.TextField(null=True, blank=True)
    is_clock_out_outside = models.BooleanField(default=False)
    clock_out_outside_reason = models.TextField(null=True, blank=True)
    is_overtime_clock_in = models.BooleanField(default=False)
    # Which surface the punch came from, and the bound handset when it was the
    # app. Recorded so "who is punching from a browser" is a query rather than a
    # guess, and so the reminders feed can surface it.
    punch_source = models.CharField(
        max_length=16,
        choices=[("mobile", "Mobile app"), ("browser", "Browser")],
        null=True, blank=True,
    )
    punch_device = models.ForeignKey(
        "user.UserDevice", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="punches",
    )
    # A punch made from a browser by someone with no bound phone is recorded but
    # held: it does not count toward hours or payroll until an admin approves it.
    # That keeps "ask a colleague to clock me in" from silently becoming paid
    # time, without locking out anyone who has not been given the app yet.
    REVIEW_STATUS_CHOICES = [
        ("not_required", "No review needed"),
        ("pending", "Pending review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]
    review_status = models.CharField(
        max_length=16, choices=REVIEW_STATUS_CHOICES, default="not_required"
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reviewed_attendances",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_note = models.TextField(null=True, blank=True)

    @property
    def counts_toward_pay(self):
        """Pending and rejected punches are excluded from hours and payroll."""
        return self.review_status in ("not_required", "approved")
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
    
    @property
    def is_overtime_session(self):
        return hasattr(self, '_is_overtime_session') and self._is_overtime_session

    @is_overtime_session.setter
    def is_overtime_session(self, value):
        self._is_overtime_session = value

    # def __str__(self):
    #     return f"Attendance #{self.id} for {self.user}"
    def __str__(self):
        # This is the safest implementation that will work regardless of your field naming
        if hasattr(self, 'user_id') and isinstance(self.user_id, int):
            return f"Attendance #{self.id} - User #{self.user_id}"
        elif hasattr(self, 'user') and hasattr(self.user, '__str__'):
            return f"Attendance #{self.id} - {str(self.user)}"
        elif hasattr(self, 'user') and hasattr(self.user, 'id'):
            return f"Attendance #{self.id} - User #{self.user.id}"
        else:
            return f"Attendance #{self.id}"

