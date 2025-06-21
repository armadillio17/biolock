from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils.timezone import now
from user.models.roles import Role
from user.models.position import Position
from user.models.department import Department


def get_profile_picture_path(instance, filename):
    return f"profile_pictures/{instance.id}/{filename}"

# Custom User Manager for seeder.
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)

        user = self.model(username=username, email=email, **extra_fields)

        # Skip set_password() since password is already hashed
        user.password = password
        user.save(using=self._db)
        return user


    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_accepted', True)

        if not extra_fields.get('first_name'):
            extra_fields['first_name'] = 'Admin'
        if not extra_fields.get('last_name'):
            extra_fields['last_name'] = 'User'

        return self.create_user(email, password, **extra_fields)


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
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    date_of_birth = models.DateField(null=True, blank=True)
    fcm_token = models.CharField(max_length=255, null=True, blank=True)


    # Government identification numbers only
    sss_number = models.CharField(max_length=20, null=True, blank=True, verbose_name="SSS Number", unique=True)
    pagibig_number = models.CharField(max_length=20, null=True, blank=True, verbose_name="Pag-IBIG Number", unique=True)
    philhealth_number = models.CharField(max_length=20, null=True, blank=True, verbose_name="PhilHealth Number", unique=True)

    # Profile Picture
    profile_picture = models.ImageField(
        upload_to=get_profile_picture_path,
        null=True,
        blank=True,
    )

    def delete(self):
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    objects = CustomUserManager()