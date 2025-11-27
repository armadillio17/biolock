from django.db import models
from django.utils import timezone
from datetime import timedelta

def now():
    return timezone.now()

class RegistrationLink(models.Model):
    registration_token = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Unique token for registration link"
    )
    is_token_used = models.BooleanField(
        default=False,
        help_text="Indicates if the token has already been used"
    )
    is_alive_hours = models.DurationField(
        default=timedelta(hours=24),
        help_text="How long the token remains valid"
    )

    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the record is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return f"Report #{self.id}"