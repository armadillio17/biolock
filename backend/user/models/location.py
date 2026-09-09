# models.py
from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius = models.PositiveIntegerField(help_text="Radius in meters")  # or FloatField if you need decimals
    is_active = models.BooleanField(default=True, help_text="Only active locations allow clock-in")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Lat: {self.latitude}, Lng: {self.longitude}, Radius: {self.radius}m)"
