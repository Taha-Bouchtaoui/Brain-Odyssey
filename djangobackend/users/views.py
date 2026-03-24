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

from .models import ChildProfile
from .serializers import RegisterSerializer, ChildProfileSerializer


# Register Parent

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


# Child Profiles 

class ChildProfileViewSet(ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    # Retourne uniquement les enfants du parent connecté
    def get_queryset(self):
        return self.request.user.children.all()

    # Lors de la création, associe automatiquement l’enfant au parent connecté
    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# FORGOT PASSWORD

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
        None,
        [email],
    )

    return Response({"message": "Lien envoyé avec succès"})


# RESET PASSWORD

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


# LOGIN AVEC LIMITE DES TENTATIVES

LOGIN_ATTEMPTS = {}  # {email: {"count": 0, "last_attempt": datetime, "blocked_until": datetime}}
MAX_ATTEMPTS = 3
BLOCK_TIME = timedelta(minutes=1)  # 1 minute de blocage

@api_view(['POST'])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")
    now = timezone.now()
    attempts = LOGIN_ATTEMPTS.get(email, {"count": 0, "last_attempt": now, "blocked_until": None})

    # Vérifier si l'utilisateur est bloqué
    if attempts["blocked_until"] and now < attempts["blocked_until"]:
        remaining = (attempts["blocked_until"] - now).seconds
        return Response(
            {"message": f"Trop de tentatives. Réessayez dans {remaining} secondes."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Authentification
    user = authenticate(username=email, password=password)
    if user:
        # Reset du compteur en cas de succès
        LOGIN_ATTEMPTS[email] = {"count": 0, "last_attempt": now, "blocked_until": None}
        # Ici tu peux retourner ton token ou info user
        return Response({"message": "Connexion réussie"})
    else:
        # Échec → incrémente le compteur
        attempts["count"] += 1
        attempts["last_attempt"] = now

        # Bloquer si dépasse MAX_ATTEMPTS
        if attempts["count"] >= MAX_ATTEMPTS:
            attempts["blocked_until"] = now + BLOCK_TIME
            attempts["count"] = 0  # reset compteur après blocage

        LOGIN_ATTEMPTS[email] = attempts
        return Response({"message": "Email ou mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)