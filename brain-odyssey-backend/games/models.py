from django.db import models
from django.contrib.auth.models import User

class World(models.Model):
    # Informations de base
    name = models.CharField(max_length=100)
    description = models.TextField()
    alt = models.CharField(max_length=100, default="World Image")
    
    # Images (tu devras copier tes images dans media/worlds/)
    image = models.ImageField(upload_to='worlds/', null=True, blank=True)
    
    # Statut du monde (par défaut dans la BD)
    default_status = models.CharField(max_length=20, default='locked')  # 'locked' ou 'unlocked'
    
    # Niveau requis pour débloquer
    required_level = models.IntegerField(default=1)
    
    # Gemmes
    gems = models.IntegerField(default=0)
    
    # Couleurs pour le frontend
    color = models.CharField(max_length=20, default="#6b5bff")
    secondary_color = models.CharField(max_length=20, default="#9d7aff")
    background_gradient = models.TextField(default="radial-gradient(ellipse at top, #0a0a3a, #03031a, #000008)")
    star_color = models.CharField(max_length=20, default="#ffffff")
    
    # Ordre d'affichage
    order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name

class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    
    # Mondes débloqués par l'utilisateur
    unlocked_worlds = models.ManyToManyField(World, related_name='unlocked_by_users', blank=True)
    
    # Monde actuel
    current_world = models.ForeignKey(World, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_for_users')
    
    # Gemmes totales de l'utilisateur
    total_gems = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Progress"
    
    def unlock_world(self, world):
        """Débloque un monde si possible"""
        if world not in self.unlocked_worlds.all():
            self.unlocked_worlds.add(world)
            return True
        return False
    
    def has_unlocked(self, world):
        """Vérifie si un monde est débloqué"""
        return world in self.unlocked_worlds.all()