from django.db import models
from django.utils.timezone import now

class DeviceToken(models.Model):
    DEVICE_TYPES = [
        ('web', 'Web'),
        ('android', 'Android'),
        ('ios', 'iOS'),
    ]

    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='device_tokens')
    token = models.TextField(unique=True)
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES, default='web')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'device_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.device_type} ({self.token[:20]}...)"
