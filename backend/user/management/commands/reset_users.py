from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from user.models import Role

User = get_user_model()

class Command(BaseCommand):
    help = 'Deletes all seeded users and roles'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting users and roles...")
        User.objects.filter(email__endswith='example.com').delete()
        Role.objects.filter(role_name__in=['superadmin', 'admin', 'user']).delete()
        self.stdout.write(self.style.SUCCESS("Successfully deleted test data"))