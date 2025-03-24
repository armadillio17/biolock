from django.db import models
from django.contrib.auth.models import User  # Assuming you use Django's built-in User model
from user.models.department import Department  # Replace `myapp` with the actual app name
from django.utils.timezone import now
from django.conf import settings

class Position(models.Model):
    position_name = models.CharField(max_length=255)
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
        return self.position_name


class PositionUser(models.Model):  # Pivot table
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)  # Track when assigned

    class Meta:
        unique_together = ('position', 'user')  # Prevent duplicate assignments

    def __str__(self):
        return f"{self.user.username} in {self.position.position_name}"
    

class DepartmentPosition(models.Model):  # Pivot table
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)  # Track when assigned

    class Meta:
        unique_together = ('department', 'position')  # Prevent duplicate assignments

    def __str__(self):
        return f"{self.department.department_name} - {self.position.position_name}"

