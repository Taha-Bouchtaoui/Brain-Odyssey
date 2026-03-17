from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('parent', 'Parent'),
        ('child', 'Child'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='child')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    parent = models.ForeignKey('self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    age = models.PositiveIntegerField(null=True, blank=True)
    pin = models.CharField(max_length=6, null=True, blank=True)
    display_name = models.CharField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class WorldProgress(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='world_progress')
    world_index = models.PositiveIntegerField()
    exercises_solved = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('profile', 'world_index')

    def __str__(self):
        return f"{self.profile.user.username} - World {self.world_index}: {self.exercises_solved}"