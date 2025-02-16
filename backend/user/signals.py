from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Role

@receiver(post_migrate)
def create_roles(sender, **kwargs):
    if sender.name == "user":  # Change "user" to your app name
        Role.objects.get_or_create(role_name="admin")
        Role.objects.get_or_create(role_name="user")