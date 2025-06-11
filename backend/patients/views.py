from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer
from owners.models import Owner
from owners.serializers import OwnerSerializer
from django.db.models import Count

class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des patients (animaux)
    Permet toutes les opérations CRUD sur les patients
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, pk=None):
        """
        Récupère un patient spécifique avec les informations de son propriétaire
        """
        try:
            patient = self.get_object()
            owner = patient.owner
            return Response({
                'patient': PatientSerializer(patient).data,
                'owner': OwnerSerializer(owner).data
            })
        except Patient.DoesNotExist:
            return Response({'message': 'Patient non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Retourne les patients récemment ajoutés avec les informations de leurs propriétaires
        """
        recent_patients = Patient.objects.all().order_by('-id')[:4]
        
        result = []
        for patient in recent_patients:
            patient_data = PatientSerializer(patient).data
            patient_data['owner'] = {
                'firstName': patient.owner.first_name,
                'lastName': patient.owner.last_name
            }
            result.append(patient_data)
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Retourne des statistiques sur les patients
        """
        total_owners = Owner.objects.count()
        total_patients = Patient.objects.count()
        
        # Pour les démos, on pourrait hardcoder ces valeurs pour l'instant
        appointments_today = 24  # Hardcodé pour démo
        treatments_completed = 19  # Hardcodé pour démo
        
        # Distribution des types d'animaux
        dog_count = Patient.objects.filter(type='dog').count()
        cat_count = Patient.objects.filter(type='cat').count()
        rabbit_count = Patient.objects.filter(type='rabbit').count()
        
        # Calcul des pourcentages
        total = total_patients
        dog_percentage = round((dog_count / total) * 100) if total > 0 else 0
        cat_percentage = round((cat_count / total) * 100) if total > 0 else 0
        rabbit_percentage = round((rabbit_count / total) * 100) if total > 0 else 0
        
        return Response({
            'totalOwners': total_owners,
            'totalPatients': total_patients,
            'appointmentsToday': appointments_today,
            'treatmentsCompleted': treatments_completed,
            'petDistribution': {
                'dogs': {'count': dog_count, 'percentage': dog_percentage},
                'cats': {'count': cat_count, 'percentage': cat_percentage},
                'rabbits': {'count': rabbit_count, 'percentage': rabbit_percentage}
            }
        })