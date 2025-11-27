from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
from user.models.roles import Role
from user.models.position import Position
from user.models.department import Department
import uuid

# Generates: profile_pictures/username_uuid/filename
def get_profile_picture_path(instance, filename):
    return f"profile_pictures/{instance.username}_{uuid.uuid4()}/{filename}"

class CustomUser(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, db_column='role_id')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, db_column='department_id')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True, db_column='position_id')
    
    profile_picture = models.ImageField(
        upload_to=get_profile_picture_path,
        null=True,
        blank=True,
        default='profile_pictures/default_profile.png'  # must exist in MEDIA_ROOT/profile_pictures/
    )

    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    phone_number = models.CharField(null=True, max_length=20, unique=True)
    email = models.EmailField(max_length=255, unique=True)

    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    sss_number = models.CharField(max_length=20, null=True, blank=True, unique=True, verbose_name="SSS Number")
    pagibig_number = models.CharField(max_length=20, null=True, blank=True, unique=True, verbose_name="Pag-IBIG Number")
    philhealth_number = models.CharField(max_length=20, null=True, blank=True, unique=True, verbose_name="PhilHealth Number")

    def delete(self):
        """Soft delete by setting the deleted_at field."""
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        """Check if the user is soft-deleted."""
        return self.deleted_at is not None

    def __str__(self):
        return f"{self.username} ({self.first_name} {self.last_name})"
