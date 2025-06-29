from rest_framework import serializers
from .models import Owner

class OwnerSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les propriétaires d'animaux"""
    
    first_name = serializers.CharField(max_length=100, required=True)
    last_name = serializers.CharField(max_length=100, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=True)
    address = serializers.CharField(required=True)

    class Meta:
        model = Owner
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'address']
        read_only_fields = ['id']