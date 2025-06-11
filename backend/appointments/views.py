from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta, time as dtime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Appointment
from .serializers import (
    AppointmentSerializer, 
    AppointmentCreateSerializer,
    AvailableSlotSerializer
)
from accounts.models import User
from patients.models import Patient

class IsVeterinarian(permissions.BasePermission):
    """Permission personnalisée pour n'autoriser que les vétérinaires"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'veterinarian'

class IsOwnerOrVet(permissions.BasePermission):
    """Permission pour le propriétaire du patient ou le vétérinaire"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'veterinarian':
            return True
        return obj.patient.owner.user == request.user

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les rendez-vous.
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['date_time', 'status', 'created_at']
    search_fields = ['patient__name', 'reason', 'notes', 'vet__full_name']

    def get_queryset(self):
        """
        Filtre les rendez-vous en fonction du rôle de l'utilisateur :
        - Admin : voit tous les rendez-vous
        - Vétérinaire : voit ses propres rendez-vous
        - Client : voit les rendez-vous de ses animaux
        - Réceptionniste : voit tous les rendez-vous à venir
        """
        queryset = super().get_queryset()
        
        # Filtre par date si spécifié
        date = self.request.query_params.get('date', None)
        if date:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%d').date()
                next_day = date_obj + timedelta(days=1)
                queryset = queryset.filter(
                    date_time__date__gte=date_obj,
                    date_time__date__lt=next_day
                )
            except ValueError:
                pass
        
        # Filtre par statut si spécifié
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filtre par vétérinaire si spécifié
        vet_id = self.request.query_params.get('vet', None)
        if vet_id:
            queryset = queryset.filter(vet_id=vet_id)
        
        # Filtre par patient si spécifié
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filtrage des permissions
        if self.request.user.role == 'veterinarian':
            # Les vétérinaires voient leurs propres rendez-vous
            return queryset.filter(vet=self.request.user)
        elif self.request.user.role == 'client':
            # Les clients voient les rendez-vous de leurs animaux
            return queryset.filter(patient__owner__user=self.request.user)
        elif self.request.user.role == 'receptionist':
            # Les réceptionnistes voient tous les rendez-vous à venir
            return queryset.filter(date_time__gte=timezone.now())
        elif self.request.user.role == 'administrator':
            # Les administrateurs voient tout
            return queryset
        else:
            return queryset.none()

    def get_serializer_class(self):
        """Utilise un serializer différent pour la création"""
        if self.action == 'create':
            return AppointmentCreateSerializer
        return super().get_serializer_class()

    def get_permissions(self):
        """
        Instancie et retourne la liste des permissions requises pour cette vue.
        """
        if self.action in ['create', 'available_slots']:
            permission_classes = [IsVeterinarian]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsVeterinarian | permissions.IsAdminUser]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """
        Renvoie les créneaux disponibles pour un vétérinaire à une date donnée.
        Paramètres attendus :
        - vet_id : ID du vétérinaire
        - date : date au format YYYY-MM-DD
        """
        vet_id = request.query_params.get('vet_id')
        date_str = request.query_params.get('date')
        
        if not vet_id or not date_str:
            return Response(
                {"error": "Les paramètres 'vet_id' et 'date' sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            vet = User.objects.get(id=vet_id, role='veterinarian')
        except (ValueError, User.DoesNotExist):
            return Response(
                {"error": "Vétérinaire non trouvé ou date invalide"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Heures d'ouverture (9h-12h et 14h-18h)
        start_morning = dtime(9, 0)
        end_morning = dtime(12, 0)
        start_afternoon = dtime(14, 0)
        end_afternoon = dtime(18, 0)
        
        # Création des créneaux de 30 minutes
        slots = []
        current_time = datetime.combine(date, start_morning)
        end_time_morning = datetime.combine(date, end_morning)
        
        # Créneaux du matin
        while current_time < end_time_morning:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Créneaux de l'après-midi
        current_time = datetime.combine(date, start_afternoon)
        end_time_afternoon = datetime.combine(date, end_afternoon)
        
        while current_time < end_time_afternoon:
            slots.append(current_time.time())
            current_time += timedelta(minutes=30)
        
        # Récupération des rendez-vous existants
        start_datetime = datetime.combine(date, dtime.min)
        end_datetime = start_datetime + timedelta(days=1)
        
        existing_appointments = Appointment.objects.filter(
            vet=vet,
            date_time__gte=start_datetime,
            date_time__lt=end_datetime,
            status__in=['scheduled', 'confirmed']
        ).values_list('date_time', flat=True)
        
        # Formatage des créneaux disponibles
        available_slots = []
        for slot in slots:
            slot_datetime = datetime.combine(date, slot)
            is_available = not any(
                appt.time() == slot for appt in existing_appointments
            )
            
            available_slots.append({
                'date': date,
                'time': slot.strftime('%H:%M'),
                'available': is_available
            })
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule un rendez-vous"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response(
                {"message": "Ce rendez-vous est déjà annulé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'cancelled'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marque un rendez-vous comme terminé"""
        appointment = self.get_object()
        
        if appointment.status == 'completed':
            return Response(
                {"message": "Ce rendez-vous est déjà marqué comme terminé."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'completed'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
