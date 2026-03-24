from django.urls import path
from . import views

urlpatterns = [
    path('worlds/', views.get_worlds, name='worlds-list'),
    path('worlds/<int:world_id>/select/', views.select_world, name='select-world'),
    path('progress/', views.get_user_progress, name='user-progress'),

     
]