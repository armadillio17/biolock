from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model

User = get_user_model()

class Notifications(models.Model):
    # user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances") 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

def __str__(self):
    if self.user:
        return f"Notification for {self.user.username}"
    return "Notification (no user)"