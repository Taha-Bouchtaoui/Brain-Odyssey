# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ChildProfile

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = ['id', 'name', 'avatar']

    # Validation stricte de l'avatar
    def validate_avatar(self, value):
        allowed = [choice[0] for choice in ChildProfile.AVATAR_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Avatar invalide. Choisissez parmi : {allowed}")
        return value