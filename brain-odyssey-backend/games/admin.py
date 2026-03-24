
from django.contrib import admin
from .models import World, UserProgress  # Importe tes modèles

# Enregistre le modèle World
@admin.register(World)
class WorldAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'default_status', 'gems', 'order')  # Colonnes à afficher
    list_editable = ('default_status', 'gems')  # Champs modifiables directement
    search_fields = ('name', 'description')  # Barre de recherche
    list_filter = ('default_status',)  # Filtres sur le côté

# Optionnel : enregistre aussi UserProgress
@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_gems', 'updated_at')