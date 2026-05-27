from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from animals.models import Pig


class HeatDetection(models.Model):
    sow = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="heat_events", verbose_name="Cerda", limit_choices_to={"sex": "female", "category": "sow"})
    heat_date = models.DateField(verbose_name="Fecha de celo")
    detected_by = models.CharField(max_length=100, blank=True, verbose_name="Detectado por")
    symptoms = models.TextField(blank=True, verbose_name="Síntomas")
    intensity = models.CharField(max_length=20, choices=[("low", "Bajo"), ("medium", "Medio"), ("high", "Alto")], default="medium", verbose_name="Intensidad")
    is_mated = models.BooleanField(default=False, verbose_name="¿Fue montada?")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Detección de celo"
        verbose_name_plural = "Detecciones de celo"
        ordering = ["-heat_date"]

    def __str__(self):
        return f"{self.sow.ear_tag} - Celo {self.heat_date}"


class MatingType(models.TextChoices):
    NATURAL = "natural", "Monta natural"
    ARTIFICIAL = "artificial", "Inseminación artificial"


class Mating(models.Model):
    sow = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="matings", verbose_name="Cerda", limit_choices_to={"sex": "female"})
    boar = models.ForeignKey(Pig, on_delete=models.SET_NULL, null=True, blank=True, related_name="mating_boar", verbose_name="Verraco", limit_choices_to={"sex": "male"})
    mating_type = models.CharField(max_length=20, choices=MatingType.choices, default=MatingType.NATURAL, verbose_name="Tipo de monta")
    mating_date = models.DateField(verbose_name="Fecha de monta")
    time_of_day = models.CharField(max_length=10, choices=[("morning", "Mañana"), ("afternoon", "Tarde")], blank=True, verbose_name="Horario")
    semen_source = models.CharField(max_length=100, blank=True, verbose_name="Fuente de semen")
    technician = models.CharField(max_length=100, blank=True, verbose_name="Técnico")
    is_successful = models.BooleanField(null=True, verbose_name="¿Exitosa?")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Monta"
        verbose_name_plural = "Montas"
        ordering = ["-mating_date"]

    def __str__(self):
        return f"{self.sow.ear_tag} - {self.get_mating_type_display()} {self.mating_date}"


class GestationStatus(models.TextChoices):
    CONFIRMED = "confirmed", "Confirmada"
    SUSPECTED = "suspected", "Sospecha"
    NOT_PREGNANT = "not_pregnant", "No gestante"
    ABORTED = "aborted", "Abortada"


class Gestation(models.Model):
    sow = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="gestations", verbose_name="Cerda", limit_choices_to={"sex": "female"})
    mating = models.ForeignKey(Mating, on_delete=models.SET_NULL, null=True, blank=True, related_name="gestations", verbose_name="Monta")
    start_date = models.DateField(verbose_name="Fecha de inicio")
    expected_farrowing_date = models.DateField(verbose_name="Fecha probable de parto")
    status = models.CharField(max_length=20, choices=GestationStatus.choices, default=GestationStatus.SUSPECTED, verbose_name="Estado")
    confirmed_date = models.DateField(null=True, blank=True, verbose_name="Fecha de confirmación")
    ultrasound_result = models.BooleanField(null=True, verbose_name="Resultado de ecografía")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Gestación"
        verbose_name_plural = "Gestiones"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.sow.ear_tag} - Gestación {self.start_date}"


class Farrowing(models.Model):
    sow = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="farrowings", verbose_name="Cerda", limit_choices_to={"sex": "female"})
    gestation = models.ForeignKey(Gestation, on_delete=models.SET_NULL, null=True, blank=True, related_name="farrowings", verbose_name="Gestación")
    farrowing_date = models.DateField(verbose_name="Fecha de parto")
    piglets_alive = models.PositiveIntegerField(default=0, verbose_name="Lechones vivos")
    piglets_stillborn = models.PositiveIntegerField(default=0, verbose_name="Lechones nacidos muertos")
    piglets_mummies = models.PositiveIntegerField(default=0, verbose_name="Momificados")
    piglets_total = models.PositiveIntegerField(editable=False, verbose_name="Total lechones")
    assisted = models.BooleanField(default=False, verbose_name="Parto asistido")
    attended_by = models.CharField(max_length=100, blank=True, verbose_name="Atendido por")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Parto"
        verbose_name_plural = "Partos"
        ordering = ["-farrowing_date"]

    def save(self, *args, **kwargs):
        self.piglets_total = self.piglets_alive + self.piglets_stillborn + self.piglets_mummies
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sow.ear_tag} - Parto {self.farrowing_date} ({self.piglets_alive} vivos)"


class PigletBatch(models.Model):
    farrowing = models.ForeignKey(Farrowing, on_delete=models.CASCADE, related_name="piglet_batches", verbose_name="Parto")
    quantity = models.PositiveIntegerField(verbose_name="Cantidad")
    sex = models.CharField(max_length=10, choices=[("male", "Macho"), ("female", "Hembra"), ("mixed", "Mixto")], verbose_name="Sexo")
    birth_weight_avg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name="Peso promedio (kg)")
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Lote de lechones"
        verbose_name_plural = "Lotes de lechones"

    def __str__(self):
        return f"{self.farrowing} - {self.quantity} lechones"


class Weaning(models.Model):
    sow = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="weanings", verbose_name="Cerda", limit_choices_to={"sex": "female"})
    farrowing = models.ForeignKey(Farrowing, on_delete=models.SET_NULL, null=True, blank=True, related_name="weanings", verbose_name="Parto")
    weaning_date = models.DateField(verbose_name="Fecha de destete")
    piglets_weaned = models.PositiveIntegerField(validators=[MinValueValidator(0)], verbose_name="Lechones destetados")
    avg_weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name="Peso promedio (kg)")
    age_days = models.PositiveIntegerField(editable=False, verbose_name="Edad al destete (días)")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Destete"
        verbose_name_plural = "Destetes"
        ordering = ["-weaning_date"]

    def save(self, *args, **kwargs):
        if self.farrowing and self.farrowing.farrowing_date:
            self.age_days = (self.weaning_date - self.farrowing.farrowing_date).days
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sow.ear_tag} - Destete {self.weaning_date} ({self.piglets_weaned} lechones)"
