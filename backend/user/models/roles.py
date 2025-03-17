from django.db import models
from django.utils.timezone import now
from django.core.exceptions import ValidationError

class Role(models.Model):
    PREDEFINED_ROLES = ['superadmin', 'admin', 'user']  # Predefined roles

    role_name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def delete(self):
        """Soft delete by setting the deleted_at field."""
        if self.is_deleted:
            raise ValidationError("This role is already deleted.")
        self.deleted_at = now()
        self.save()

    def restore(self):
        """Restore a soft-deleted role."""
        self.deleted_at = None
        self.save()

    @property
    def is_deleted(self):
        """Check if the role is soft-deleted."""
        return self.deleted_at is not None

    def clean(self):
        """Custom validation rules."""
        if not self.role_name.strip():
            raise ValidationError("Role name cannot be empty.")
        if not self.role_name.isalpha():
            raise ValidationError("Role name must contain only letters.")
        if len(self.role_name) < 3:
            raise ValidationError("Role name must be at least 3 characters long.")

    def __str__(self):
        return self.role_name
