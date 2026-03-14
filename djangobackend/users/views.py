# views.py
from rest_framework import generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from .models import ChildProfile
from .serializers import RegisterSerializer, ChildProfileSerializer


# -----------------------
# Register Parent
# -----------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


# -----------------------
# Child Profiles (Netflix style)
# -----------------------
class ChildProfileViewSet(ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    # Retourne uniquement les enfants du parent connecté
    def get_queryset(self):
        return self.request.user.children.all()

    # Lors de la création, associe automatiquement l’enfant au parent connecté
    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# -----------------------
# FORGOT PASSWORD
# -----------------------
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


# -----------------------
# RESET PASSWORD
# -----------------------
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