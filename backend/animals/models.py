from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Sex(models.TextChoices):
    MALE = "male", "Macho"
    FEMALE = "female", "Hembra"


class PigStatus(models.TextChoices):
    ACTIVE = "active", "Activo"
    SOLD = "sold", "Vendido"
    DEAD = "dead", "Muerto"
    TRANSFERRED = "transferred", "Transferido"


class PigCategory(models.TextChoices):
    SOW = "sow", "Cerda Madre"
    BOAR = "boar", "Verraco"
    PIGLET = "piglet", "Lechón"
    GROWER = "grower", "Cerdo Engorde"
    REPLACEMENT = "replacement", "Reemplazo"


class SowStatus(models.TextChoices):
    EMPTY = "empty", "Vacía"
    GESTATING = "gestating", "Gestante"
    LACTATING = "lactating", "Lactante"


class Breed(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Raza")
    description = models.TextField(blank=True, verbose_name="Descripción")

    class Meta:
        verbose_name = "Raza"
        verbose_name_plural = "Razas"

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    capacity = models.PositiveIntegerField(default=0, verbose_name="Capacidad")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Ubicación"
        verbose_name_plural = "Ubicaciones"

    def __str__(self):
        return f"{self.code} - {self.name}"


class Pig(models.Model):
    ear_tag = models.CharField(max_length=50, unique=True, verbose_name="Arete/ID")
    name = models.CharField(max_length=100, blank=True, verbose_name="Nombre")
    breed = models.ForeignKey(Breed, on_delete=models.SET_NULL, null=True, verbose_name="Raza")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Fecha de nacimiento")
    sex = models.CharField(max_length=10, choices=Sex.choices, verbose_name="Sexo")
    category = models.CharField(max_length=20, choices=PigCategory.choices, default=PigCategory.SOW, verbose_name="Categoría")
    sow_status = models.CharField(max_length=20, choices=SowStatus.choices, null=True, blank=True, verbose_name="Estado reproductivo")
    status = models.CharField(max_length=20, choices=PigStatus.choices, default=PigStatus.ACTIVE, verbose_name="Estado")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ubicación")
    mother = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="offspring_mother", verbose_name="Madre")
    father = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="offspring_father", verbose_name="Padre")
    entry_date = models.DateField(auto_now_add=True, verbose_name="Fecha de ingreso")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cerdo"
        verbose_name_plural = "Cerdos"
        indexes = [
            models.Index(fields=["ear_tag"]),
            models.Index(fields=["status"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return f"{self.ear_tag} - {self.get_sex_display()} ({self.get_category_display()})"

    @property
    def age_days(self):
        if self.birth_date:
            from django.utils import timezone
            return (timezone.now().date() - self.birth_date).days
        return 0


class WeightRecord(models.Model):
    pig = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="weights", verbose_name="Cerdo")
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Peso (kg)")
    date = models.DateField(verbose_name="Fecha")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Registro de peso"
        verbose_name_plural = "Registros de peso"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.pig.ear_tag} - {self.weight_kg}kg ({self.date})"
