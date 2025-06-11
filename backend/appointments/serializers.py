from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer
from accounts.serializers import UserSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Appointment"""
    
    # Champs en lecture seule
    patient_details = serializers.SerializerMethodField(read_only=True)
    vet_details = serializers.SerializerMethodField(read_only=True)
    is_past_due = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'vet', 'date_time', 'reason', 'status', 
            'notes', 'created_at', 'updated_at', 'patient_details', 
            'vet_details', 'is_past_due'
        ]
        read_only_fields = ('created_at', 'updated_at')
    
    def get_patient_details(self, obj):
        from patients.serializers import PatientSerializer
        return PatientSerializer(obj.patient).data
    
    def get_vet_details(self, obj):
        from accounts.serializers import UserSerializer
        return UserSerializer(obj.vet).data
    
    def validate(self, data):
        """
        Validation personnalisée pour s'assurer que :
        - La date n'est pas dans le passé
        - Le vétérinaire est disponible à cette heure
        - Le patient n'a pas déjà un rendez-vous à cette heure
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Vérification de la date
        if 'date_time' in data and data['date_time'] < timezone.now():
            raise serializers.ValidationError({"date_time": "La date du rendez-vous ne peut pas être dans le passé."})
        
        # Vérification de la disponibilité du vétérinaire
        if 'vet' in data and 'date_time' in data:
            start_time = data['date_time']
            end_time = start_time + timedelta(minutes=30)  # Durée par défaut d'un rendez-vous
            
            # Vérification des conflits de rendez-vous
            overlapping_appointments = Appointment.objects.filter(
                vet=data['vet'],
                date_time__lt=end_time,
                date_time__gt=start_time - timedelta(minutes=30)
            )
            
            # Exclure le rendez-vous actuel en cas de mise à jour
            if self.instance:
                overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)
            
            if overlapping_appointments.exists():
                raise serializers.ValidationError({"date_time": "Le vétérinaire a déjà un rendez-vous à cet horaire."})
        
        return data


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un rendez-vous"""
    
    class Meta:
        model = Appointment
        fields = ['patient', 'vet', 'date_time', 'reason', 'status']
    
    def validate(self, data):
        # Vérifier que le vétérinaire est bien un vétérinaire
        if data['vet'].role != 'veterinarian':
            raise serializers.ValidationError({"vet": "Le praticien sélectionné n'est pas un vétérinaire."})
        return data


class AvailableSlotSerializer(serializers.Serializer):
    """Serializer pour les créneaux disponibles"""
    date = serializers.DateField()
    time = serializers.TimeField()
    available = serializers.BooleanField()
