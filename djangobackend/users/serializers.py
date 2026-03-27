from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ParentProfile, ChildProfile


class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    children = serializers.ListField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id','email', 'password', 'phone_number', 'children']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', None)
        children_data = validated_data.pop('children', [])

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        user.is_active = False
        user.save()

        if phone_number:
            ParentProfile.objects.create(user=user, phone_number=phone_number)

        for child in children_data:
            ChildProfile.objects.create(
                parent=user,
                name=child.get('name'),
                avatar=child.get('avatar'),
                age=child.get('age')
            )

        from .models import EmailVerification
        from django.utils import timezone
        from datetime import timedelta
        import random
        from django.core.mail import send_mail

        code = str(random.randint(100000, 999999))

        EmailVerification.objects.update_or_create(
            user=user,
            defaults={
                "code": code,
                "expires_at": timezone.now() + timedelta(minutes=5)
            }
        )

        send_mail(
            "Code de vérification",
            f"Votre code est : {code}",
            "no-reply@mathgame.com",
            [user.email],
            fail_silently=False,
        )

        return user


# 🔥 AJOUT MANQUANT
class ChildProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChildProfile
        fields = ['id', 'name', 'avatar', 'age']