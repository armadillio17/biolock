from django.conf import settings
from django.db import models
from django.utils.timezone import now


class UserDevice(models.Model):
    """One phone, one person.

    Two partial unique constraints carry the rule: a handset can have only one
    *active* binding, so it can never be punching for two employees at once, and
    a user can hold only one *active* device, so swapping handsets needs an admin
    to revoke the old one. Both are scoped to active rows, which lets revoked
    bindings remain as an audit trail.
    """

    PLATFORM_CHOICES = [
        ("android", "Android"),
        ("ios", "iOS"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="devices"
    )
    # ANDROID_ID / installation id reported by the app. Not globally unique:
    # revoked rows stay behind as history, and the same handset can legitimately
    # be bound again later (found phone, reassigned to a new hire). The partial
    # constraint below is what actually enforces one owner at a time.
    android_id = models.CharField(max_length=128, db_index=True)
    platform = models.CharField(max_length=16, choices=PLATFORM_CHOICES, default="android")
    device_name = models.CharField(max_length=255, null=True, blank=True)
    device_model = models.CharField(max_length=255, null=True, blank=True)
    app_version = models.CharField(max_length=32, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="revoked_devices",
    )
    revoke_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # A user can hold at most one active device at a time. Revoked rows
            # stay behind as history, which is why this is a partial constraint
            # rather than a plain unique_together.
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(is_active=True),
                name="one_active_device_per_user",
            ),
            models.UniqueConstraint(
                fields=["android_id"],
                condition=models.Q(is_active=True),
                name="one_active_binding_per_device",
            ),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        label = self.device_name or self.device_model or self.android_id[:12]
        return f"{label} ({'active' if self.is_active else 'revoked'})"

    def revoke(self, by=None, reason=None):
        self.is_active = False
        self.revoked_at = now()
        self.revoked_by = by
        self.revoke_reason = reason
        self.save(update_fields=[
            "is_active", "revoked_at", "revoked_by", "revoke_reason", "updated_at",
        ])

    def touch(self):
        self.last_seen_at = now()
        self.save(update_fields=["last_seen_at", "updated_at"])
