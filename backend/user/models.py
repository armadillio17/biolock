from django.db import models
from django.utils.timezone import now

# Create your models here.

class Role(models.Model):
    role_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self, *args, **kwargs):
        self.deleted_at = now()
        self.save()

    @property
    def is_deleted(self):
        return self.deleted_at is not None
