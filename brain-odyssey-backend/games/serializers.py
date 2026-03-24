from rest_framework import serializers
from django.contrib.auth.models import User
from .models import World, UserProgress

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class WorldSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = World
        fields = [
            'id', 'name', 'description', 'alt', 'image',
            'status', 'required_level', 'gems',
            'color', 'secondary_color', 'background_gradient', 'star_color'
        ]
    
    def get_status(self, obj):
        return obj.default_status  # Simple pour l'instant

# AJOUTE CE SERIALIZER MANQUANT
class UserProgressSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    unlocked_worlds = WorldSerializer(many=True, read_only=True)
    current_world = WorldSerializer(read_only=True)

    class Meta:
        model = UserProgress
        fields = ['id', 'username', 'unlocked_worlds', 'current_world', 'total_gems', 'updated_at']
