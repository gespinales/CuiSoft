from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN = "admin", "Administrador"
    VETERINARIAN = "veterinarian", "Veterinario"
    MANAGER = "manager", "Encargado"
    OPERATOR = "operator", "Operario"
    VIEWER = "viewer", "Visor"


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OPERATOR)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
