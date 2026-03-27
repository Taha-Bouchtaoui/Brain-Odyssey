from rest_framework import generics, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random

from .models import ChildProfile, EmailVerification
from .serializers import RegisterSerializer, ChildProfileSerializer

from django.shortcuts import get_object_or_404
from django.http import JsonResponse


# =========================
# REGISTER
# =========================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        # 🔐 Générer code
        code = str(random.randint(100000, 999999))

        EmailVerification.objects.update_or_create(
            user=user,
            defaults={
                "code": code,
                "expires_at": timezone.now() + timedelta(minutes=5)
            }
        )

        # 📧 Envoyer email
        send_mail(
            "Code de vérification",
            f"Votre code est : {code}",
            "no-reply@mathgame.com",
            [user.email],
            fail_silently=False,
        )


# =========================
# CHILD PROFILE
# =========================

class ChildProfileViewSet(ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.children.all()

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# =========================
# VERIFY EMAIL (CODE)
# =========================

@api_view(['POST'])
def verify_email(request):
    email = request.data.get("email")
    code = request.data.get("code")

    try:
        user = User.objects.get(email=email)
        verification = user.email_verification
    except:
        return Response({"message": "Utilisateur non trouvé"}, status=404)

    if verification.code != code:
        return Response({"message": "Code incorrect"}, status=400)

    if verification.expires_at < timezone.now():
        return Response({"message": "Code expiré"}, status=400)

    # 🔥 ACTIVER LE COMPTE
    user.is_active = True
    user.save()

    # 🔥 Supprimer le code
    verification.delete()

    return Response({"message": "Email vérifié avec succès"})


# =========================
# RESEND CODE
# =========================

@api_view(['POST'])
def resend_code(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Utilisateur non trouvé"}, status=404)

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

    return Response({"message": "Code renvoyé"})


# =========================
# LOGIN
# =========================

LOGIN_ATTEMPTS = {}
MAX_ATTEMPTS = 3
BLOCK_TIME = timedelta(minutes=1)

@api_view(['POST'])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    now = timezone.now()

    attempts = LOGIN_ATTEMPTS.get(email, {
        "count": 0,
        "blocked_until": None
    })

    # 🔒 blocage temporaire
    if attempts["blocked_until"] and now < attempts["blocked_until"]:
        remaining = (attempts["blocked_until"] - now).seconds
        return Response(
            {"message": f"Trop de tentatives. Réessayez dans {remaining} secondes."},
            status=status.HTTP_403_FORBIDDEN
        )

    user = authenticate(username=email, password=password)

    if user:
        # 🔥 BLOQUER SI NON VERIFIE
        if not user.is_active:
            return Response(
                {"message": "Veuillez vérifier votre email"},
                status=status.HTTP_403_FORBIDDEN
            )

        # reset attempts
        LOGIN_ATTEMPTS[email] = {"count": 0, "blocked_until": None}

        return Response({"message": "Connexion réussie"})

    else:
        attempts["count"] += 1

        if attempts["count"] >= MAX_ATTEMPTS:
            attempts["blocked_until"] = now + BLOCK_TIME
            attempts["count"] = 0

        LOGIN_ATTEMPTS[email] = attempts

        return Response(
            {"message": "Email ou mot de passe incorrect"},
            status=status.HTTP_401_UNAUTHORIZED
        )


# =========================
# FORGOT PASSWORD
# =========================

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "Email non trouvé"}, status=404)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

    send_mail(
        "Réinitialisation de mot de passe",
        f"Cliquez sur ce lien : {reset_link}",
        "no-reply@mathgame.com",
        [email],
        fail_silently=False,
    )

    return Response({"message": "Lien envoyé avec succès"})


# =========================
# RESET PASSWORD
# =========================

@api_view(['POST'])
def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except:
        return Response({"message": "Lien invalide"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"message": "Token invalide"}, status=400)

    new_password = request.data.get("password")
    user.set_password(new_password)
    user.save()

    return Response({"message": "Mot de passe réinitialisé avec succès"})