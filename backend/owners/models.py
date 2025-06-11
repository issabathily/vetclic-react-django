from django.db import models

class Owner(models.Model):
    """Model représentant un propriétaire d'animal"""
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"