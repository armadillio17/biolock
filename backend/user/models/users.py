from django.db import models
from django.utils.timezone import now
# from django.contrib.auth.models import User  # Import Django's built-in User model
from django.contrib.auth.models import AbstractUser


# Create own models per table.
class CustomUser(AbstractUser):
    role_id = models.IntegerField(null=True, blank=True)
    department_id = models.IntegerField(null=True, blank=True)
    position_id = models.IntegerField(null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(null=True, max_length=20, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    def delete(self):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the role is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return self.role_id