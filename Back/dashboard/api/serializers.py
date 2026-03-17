from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

class ChildSerializer(serializers.Serializer):
    username = serializers.CharField()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('parent', 'Parent'), ('child', 'Child')], required=True, write_only=True)
    pin = serializers.CharField(write_only=True , min_length=4, max_length=6)
    children = ChildSerializer(many=True, required=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role','pin', 'children']

    def create(self, validated_data):
        role = validated_data.pop('role')
        pin = validated_data.pop('pin' ,None)
        children_data = validated_data.pop('children', [])
        user = User.objects.create_user(**validated_data)
        parent_profile, _ = Profile.objects.get_or_create(user=user)
        parent_profile.role = role
        parent_profile.pin = pin
        parent_profile.parent = None
        parent_profile.save()
        if role == 'parent' and children_data:
            for child_data in children_data:
                auto_password = __import__('uuid').uuid4().hex
                child_user = User.objects.create_user(
                    username=child_data['username'],
                    password=auto_password,
                )
                child_profile, _ = Profile.objects.get_or_create(user=child_user)
                child_profile.role = 'child'
                child_profile.parent = parent_profile
                child_profile.save()
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        try:
            data['role'] = self.user.profile.role
        except:
            data['role'] = 'child'
        return data