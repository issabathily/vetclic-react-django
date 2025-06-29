from rest_framework import serializers
from .models import Patient
from owners.serializers import OwnerSerializer

class PatientSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les patients (animaux)"""
    owner_details = OwnerSerializer(source='owner', read_only=True)
    
    class Meta:
        model = Patient
        fields = ['id', 'name', 'type', 'breed', 'birth_date', 'weight', 'sex', 'owner', 'owner_details']
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['type_display'] = instance.get_type_display()
        representation['sex_display'] = instance.get_sex_display()
        return representation