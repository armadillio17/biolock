from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class BenefitsConfiguration(models.Model):
    BENEFIT_CHOICES = [
        ('philhealth', 'PhilHealth'),
        ('sss', 'SSS'),
        ('pagibig', 'Pag-IBIG'),
    ]

    benefit_type = models.CharField(
        max_length=20,
        choices=BENEFIT_CHOICES,
        unique=True,
        primary_key=True
    )
    employee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    employer_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Benefits Configuration"
        verbose_name_plural = "Benefits Configurations"

    def __str__(self):
        return f"{self.get_benefit_type_display()} Configuration"