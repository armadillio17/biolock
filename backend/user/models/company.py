from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    location = models.ForeignKey('Location', on_delete=models.CASCADE, related_name='companies')
    ip_address = models.GenericIPAddressField(protocol='both', unpack_ipv4=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['name']

    def __str__(self):
        return self.name