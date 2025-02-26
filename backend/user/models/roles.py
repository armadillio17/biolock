from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User  # Import Django's built-in User model


# Create your models here.
    
class Role(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]

    role_name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def delete(self):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the role is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return self.role_name
    

