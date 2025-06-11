from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'affichage des utilisateurs"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'role', 'email']
        read_only_fields = ['id']


class UserCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création des utilisateurs"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        # Utiliser l'email comme username
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Sérialiseur pour la connexion"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)