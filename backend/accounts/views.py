from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer
from .permissions import IsAdministrator, IsVetOrAdmin, IsReceptionistOrAdmin

class RegisterView(APIView):
    """Vue pour l'enregistrement d'un nouvel utilisateur"""
    permission_classes = [AllowAny]

    def post(self, request):
        # Préparer les données pour le serializer
        data = {
            'email': request.data.get('email'),
            'password': request.data.get('password'),
            'password2': request.data.get('password2'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
            'role': request.data.get('role')
        }
        
        serializer = UserCreateSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """Vue pour la connexion d'un utilisateur"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            
            if user:
                # Vérifier si l'utilisateur a un rôle valide
                valid_roles = ['administrator', 'veterinarian', 'receptionist']
                if user.role not in valid_roles:
                    return Response({'message': 'Rôle invalide'}, status=status.HTTP_401_UNAUTHORIZED)
                
                refresh = RefreshToken.for_user(user)
                user_serializer = UserSerializer(user)
                
                return Response({
                    'user': user_serializer.data,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh)
                })
            
            return Response({'message': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """Vue pour la déconnexion d'un utilisateur"""
    permission_classes = [IsAuthenticated]

# Vues pour la gestion des utilisateurs et des rôles

class UserListView(generics.ListCreateAPIView):
    """Vue pour lister et créer des utilisateurs"""
    permission_classes = [IsAdministrator]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.all()

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour gérer un utilisateur spécifique"""
    permission_classes = [IsAdministrator]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.all()

class RoleListView(generics.ListAPIView):
    """Vue pour lister les rôles disponibles"""
    permission_classes = [IsAdministrator]
    
    def get(self, request):
        roles = [
            {'value': 'administrator', 'label': 'Administrateur'},
            {'value': 'veterinarian', 'label': 'Vétérinaire'},
            {'value': 'receptionist', 'label': 'Réceptionniste'}
        ]
        return Response(roles)

class UserManagementView(APIView):
    """Vue pour gérer les utilisateurs"""
    permission_classes = [IsAdministrator]
    
    def post(self, request):
        """Créer un nouvel utilisateur"""
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        """Modifier un utilisateur existant"""
        user = User.objects.get(pk=pk)
        serializer = UserCreateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Supprimer un utilisateur"""
        user = User.objects.get(pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def post(self, request):
        # Pour une déconnexion complète, le client doit supprimer le token
        # Côté serveur, on peut blacklister le token
        try:
            # Si le client a envoyé un token de rafraîchissement, on le blackliste
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Erreur lors de la déconnexion'}, status=status.HTTP_400_BAD_REQUEST)