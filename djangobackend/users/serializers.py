# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChildProfile, ParentProfile

# Serializer pour l'enregistrement du parent
class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', None)
        # Création de l'utilisateur
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Création optionnelle du ParentProfile si téléphone fourni
        if phone_number:
            ParentProfile.objects.create(user=user, phone_number=phone_number)
        return user


# Serializer pour les enfants
class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = ['id', 'name', 'avatar', 'age']  # ajout de 'age'

    # Plus de validation stricte sur l'avatar
    # L'avatar peut être n'importe quel fichier envoyé depuis le front