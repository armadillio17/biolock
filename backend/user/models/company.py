from django.db import models
from django.utils.timezone import now


class Company(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    company_ip = models.CharField(max_length=45, null=True, blank=True)
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
        return f"Company #{self.id} - {self.user}"
