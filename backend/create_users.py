import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vet_clinic.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import User as VetUser

def create_users():
    users = [
        {'username': 'admin', 'password': 'password', 'email': 'admin@example.com', 'role': 'administrator', 'is_superuser': True, 'is_staff': True},
        {'username': 'vet', 'password': 'password', 'email': 'vet@example.com', 'role': 'veterinarian'},
        {'username': 'reception', 'password': 'password', 'email': 'reception@example.com', 'role': 'receptionist'},
    ]

    for user_data in users:
        try:
            user = VetUser.objects.get(username=user_data['username'])
            print(f"User {user_data['username']} already exists")
        except VetUser.DoesNotExist:
            user = VetUser.objects.create_user(
                username=user_data['username'],
                password=user_data['password'],
                email=user_data['email'],
                role=user_data['role'],
                is_superuser=user_data.get('is_superuser', False),
                is_staff=user_data.get('is_staff', False)
            )
            print(f"Created user: {user.username} ({user.get_role_display()})")

if __name__ == '__main__':
    create_users()
