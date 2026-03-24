from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny , IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import World, UserProgress
from .serializers import WorldSerializer, UserProgressSerializer , UserSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_worlds(request):
    """Récupère tous les mondes"""
    worlds = World.objects.all()
    serializer = WorldSerializer(worlds, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def select_world(request, world_id):
    """Sélectionne un monde"""
    world = get_object_or_404(World, id=world_id)
    return Response({
        'message': f'Monde {world.name} sélectionné',
        'current_world': WorldSerializer(world).data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_progress(request):
    """Progression fictive pour les tests"""
    return Response({
        'total_gems': 0,
        'unlocked_worlds': [],
        'current_world': None
    })

  