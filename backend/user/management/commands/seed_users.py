from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from user.models import Role
import random
from faker import Faker
import bcrypt

fake = Faker()

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with roles and sample users using bcrypt'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding roles...")
        self.create_roles()
        self.stdout.write("Roles created.")

        self.stdout.write("Seeding admin user...")
        self.create_admin()
        self.stdout.write("Admin user created.")

        self.stdout.write("Seeding regular users...")
        self.create_regular_users(10)
        self.stdout.write("Regular users created.")

        self.stdout.write(self.style.SUCCESS('Successfully seeded all data'))

    def create_roles(self):
        for role_name in ['superadmin', 'admin', 'user']:
            Role.objects.get_or_create(role_name=role_name)

    def create_admin(self):
        admin_role = Role.objects.get(role_name='admin')

        # Hash password with bcrypt
        hashed_password = bcrypt.hashpw('adminpassword123'.encode(), bcrypt.gensalt()).decode()

        User.objects.create_user(
            email='admin@example.com',
            username='admin',
            password=hashed_password,
            first_name='System',
            last_name='Admin',
            phone_number='+639123456789',
            role=admin_role,
            is_accepted=True
        )

    def create_regular_users(self, count=10):
        role_user = Role.objects.get(role_name='user')
        half = count // 2

        for i in range(count):
            fname = fake.first_name()
            lname = fake.last_name()
            email = f"{fname.lower()}.{lname.lower()}{i}@example.com"
            sss = f"SSS{i+1000}"
            pagibig = f"PIG{i+1000}"
            philhealth = f"PH{i+1000}"

            hashed_password = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()

            User.objects.create_user(
                email=email,
                username=f"user{i}",
                password=hashed_password,
                first_name=fname,
                last_name=lname,
                phone_number=f"+6391234567{i:02d}",
                role=role_user,
                is_accepted=i < half,
                sss_number=sss,
                pagibig_number=pagibig,
                philhealth_number=philhealth
            )