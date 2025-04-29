from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()

class Logs(models.Model):
    # user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances") 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_logs") 
    action = models.CharField(max_length=255)
    details = models.TextField()
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
        return f"Logs {self.details} on {self.action}"
