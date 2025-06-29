from django.db import models
from owners.models import Owner

class Patient(models.Model):
    """Modèle représentant un patient animal"""
    TYPE_CHOICES = [
        ('dog', 'Chien'),
        ('cat', 'Chat'),
        ('rabbit', 'Lapin'),
    ]
    
    SEX_CHOICES = [
        ('male', 'Mâle'),
        ('female', 'Femelle'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    breed = models.CharField(max_length=100)
    birth_date = models.DateField()
    weight = models.CharField(max_length=20)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    owner = models.ForeignKey(Owner, related_name='patients', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"