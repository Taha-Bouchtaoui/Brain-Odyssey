from django.db import models
from django.contrib.auth.models import User

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.user.username


class ChildProfile(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name="children")
    name = models.CharField(max_length=50)
    avatar = models.CharField(max_length=50)
    age = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name