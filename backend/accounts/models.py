from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Modèle utilisateur étendu pour l'application vétérinaire"""
    ROLE_CHOICES = [
        ('administrator', 'Administrateur'),
        ('veterinarian', 'Vétérinaire'),
        ('receptionist', 'Réceptionniste'),
    ]
    
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='receptionist')
    full_name = models.CharField(max_length=255, blank=True)
    
    def save(self, *args, **kwargs):
        self.full_name = f"{self.first_name} {self.last_name}".strip()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"