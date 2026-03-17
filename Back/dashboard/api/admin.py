from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Profile, WorldProgress

admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_staff')

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'parent')
    list_filter = ('role',)

@admin.register(WorldProgress)
class WorldProgressAdmin(admin.ModelAdmin):
    list_display = ('profile', 'world_index', 'exercises_solved')
    list_filter = ('world_index',)