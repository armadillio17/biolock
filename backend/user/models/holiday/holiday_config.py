from django.db import models
from .holiday import Holiday
from .custom_holiday import CustomHoliday

class HolidayConfig(models.Model):
    holiday = models.ForeignKey(
        Holiday,
        on_delete=models.CASCADE,
        related_name='config',
        null=True,
        blank=True
    )
    custom_holiday = models.ForeignKey(
        CustomHoliday,
        on_delete=models.CASCADE,
        related_name='custom_config',
        null=True,
        blank=True
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
        return f"{self.holiday.name if self.holiday else self.custom_holiday.name} - {self.type}"

    def clean(self):
        from django.core.exceptions import ValidationError
        # Ensure exactly one of the two is set
        if bool(self.holiday) == bool(self.custom_holiday):
            raise ValidationError("Exactly one of 'holiday' or 'custom_holiday' must be set.")