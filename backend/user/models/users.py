from django.db import models
from django.utils.timezone import now
# from django.contrib.auth.models import User  # Import Django's built-in User model
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import FileSystemStorage
from django.contrib.auth.base_user import BaseUserManager
from django.utils.timezone import now
from user.models.roles import Role
from user.models.position import Position
from user.models.department import Department


def get_profile_picture_path(instance, filename):
    return f"profile_pictures/{instance.id}/{filename}"

# Create own models per table.
class CustomUser(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, db_column='role_id')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, db_column='department_id')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True, db_column='position_id')
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(null=True, max_length=20, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    # is_approved = models.BooleanField(default=False)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Government identification numbers only
    sss_number = models.CharField(
        max_length=20, 
        null=True, 
        blank=True, 
        verbose_name="SSS Number",
        unique=True
    )
    pagibig_number = models.CharField(
        max_length=20, 
        null=True, 
        blank=True, 
        verbose_name="Pag-IBIG Number",
        unique=True
    )
    philhealth_number = models.CharField(
        max_length=20, 
        null=True, 
        blank=True, 
        verbose_name="PhilHealth Number",
        unique=True
    )

    # Profile Picture
    profile_picture = models.ImageField(
        upload_to=get_profile_picture_path,
        storage=FileSystemStorage(location='media/profile_pictures'),
        null=True,
        blank=True,
        default='default_profile.png'
    )
    
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