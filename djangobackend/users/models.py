from django.db import models
from django.contrib.auth.models import User

class ChildProfile(models.Model):
    AVATAR_CHOICES = [
        ("warrior.png", "warrior"),
        ("wizard.png", "wizard"),
        ("knight.png", "knight"),
        ("ninja.png", "ninja"),
    ]

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="children")
    name = models.CharField(max_length=50)
    avatar = models.CharField(max_length=50, choices=AVATAR_CHOICES)

    def __str__(self):
        return self.name

        