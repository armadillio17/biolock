from django.db import models
from django.utils.timezone import now

class CustomHoliday(models.Model):
    custom_holiday_date = models.DateField(unique=True)  
    custom_holiday_name = models.CharField(max_length=255)
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
        return f"CustomHoliday {self.custom_holiday_name} on {self.custom_holiday_date}"
