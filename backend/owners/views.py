from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Owner
from .serializers import OwnerSerializer
from patients.models import Patient
from patients.serializers import PatientSerializer

class OwnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des propriétaires
    Permet toutes les opérations CRUD sur les propriétaires
    """
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def patients(self, request, pk=None):
        """
        Liste tous les patients associés à un propriétaire spécifique
        """
        try:
            owner = self.get_object()
            patients = Patient.objects.filter(owner=owner)
            serializer = PatientSerializer(patients, many=True)
            return Response({'owner': OwnerSerializer(owner).data, 'patients': serializer.data})
        except Owner.DoesNotExist:
            return Response({'message': 'Propriétaire non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Retourne les propriétaires récemment ajoutés (limité à 4)
        avec le nombre de patients par propriétaire
        """
        owners = Owner.objects.all().order_by('-id')[:4]  # Prendre les 4 derniers propriétaires
        
        # Pour chaque propriétaire, ajouter le nombre de patients
        owners_with_counts = []
        for owner in owners:
            patient_count = Patient.objects.filter(owner=owner).count()
            owner_data = OwnerSerializer(owner).data
            owner_data['patientCount'] = patient_count
            owners_with_counts.append(owner_data)
        
        return Response(owners_with_counts)

    @action(detail=False, methods=['get'])
    def check_email(self, request):
        """
        Vérifie si un email existe déjà
        """
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email parameter is required'}, status=400)
        
        try:
            owner = Owner.objects.get(email=email)
            return Response({'exists': True, 'owner_id': owner.id})
        except Owner.DoesNotExist:
            return Response({'exists': False})