from django.db import models
from .holiday import Holiday

class HolidayConfig(models.Model):
    holiday = models.OneToOneField(
        Holiday,
        on_delete=models.CASCADE,
        related_name='config'
    )
    HOLIDAY_TYPE_CHOICES = (
        ('regular', 'Regular'),
        ('special', 'Special'),
        ('non-holiday', 'Non-Holiday'),
    )
    type = models.CharField(
        max_length=20,
        choices=HOLIDAY_TYPE_CHOICES,
        default='regular'
    )
    pay_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Extra pay percentage for this holiday (e.g., 100.00 for double pay, 30.00 for 30% extra)"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.holiday.name} - {self.type}"