from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSalary(models.Model):
    SALARY_TYPE_CHOICES = [
        ("monthly", "Monthly"),
        ("hourly", "Hourly"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="salary", null=True, blank=True)
    salary_type = models.CharField(max_length=20, choices=SALARY_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField(default=now)

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
