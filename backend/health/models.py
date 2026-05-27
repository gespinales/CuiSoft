from django.db import models
from django.core.validators import MinValueValidator
from animals.models import Pig


class Vaccine(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre")
    laboratory = models.CharField(max_length=200, blank=True, verbose_name="Laboratorio")
    lot_number = models.CharField(max_length=100, blank=True, verbose_name="Lote")
    presentation = models.CharField(max_length=100, blank=True, verbose_name="Presentación")
    days_to_immunity = models.PositiveIntegerField(default=0, verbose_name="Días hasta inmunidad")
    duration_days = models.PositiveIntegerField(default=180, verbose_name="Duración (días)")
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Vacuna"
        verbose_name_plural = "Vacunas"

    def __str__(self):
        return self.name


class VaccinationSchedule(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre del esquema")
    description = models.TextField(blank=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Esquema de vacunación"
        verbose_name_plural = "Esquemas de vacunación"

    def __str__(self):
        return self.name


class VaccinationScheduleItem(models.Model):
    schedule = models.ForeignKey(VaccinationSchedule, on_delete=models.CASCADE, related_name="items", verbose_name="Esquema")
    vaccine = models.ForeignKey(Vaccine, on_delete=models.CASCADE, verbose_name="Vacuna")
    dose_number = models.PositiveIntegerField(default=1, verbose_name="Número de dosis")
    apply_at_age_days = models.PositiveIntegerField(verbose_name="Aplicar a los (días)")
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Item del esquema"
        verbose_name_plural = "Items del esquema"
        ordering = ["apply_at_age_days", "dose_number"]

    def __str__(self):
        return f"{self.schedule.name} - {self.vaccine.name} (día {self.apply_at_age_days})"


class VaccinationRecord(models.Model):
    pig = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="vaccinations", verbose_name="Cerdo")
    vaccine = models.ForeignKey(Vaccine, on_delete=models.CASCADE, verbose_name="Vacuna")
    application_date = models.DateField(verbose_name="Fecha de aplicación")
    dose_ml = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name="Dosis (ml)")
    applied_by = models.CharField(max_length=100, blank=True, verbose_name="Aplicado por")
    batch_number = models.CharField(max_length=100, blank=True, verbose_name="Lote de la vacuna")
    next_due_date = models.DateField(null=True, blank=True, verbose_name="Próxima dosis")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Registro de vacunación"
        verbose_name_plural = "Registros de vacunación"
        ordering = ["-application_date"]

    def __str__(self):
        return f"{self.pig.ear_tag} - {self.vaccine.name} ({self.application_date})"


class TreatmentType(models.TextChoices):
    ANTIBIOTIC = "antibiotic", "Antibiótico"
    ANTIINFLAMMATORY = "antiinflammatory", "Antiinflamatorio"
    ANTIPARASITIC = "antiparasitic", "Antiparasitario"
    VITAMIN = "vitamin", "Vitamina"
    OTHER = "other", "Otro"


class Treatment(models.Model):
    pig = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="treatments", verbose_name="Cerdo")
    treatment_type = models.CharField(max_length=20, choices=TreatmentType.choices, verbose_name="Tipo")
    medication = models.CharField(max_length=200, verbose_name="Medicamento")
    start_date = models.DateField(verbose_name="Fecha de inicio")
    end_date = models.DateField(null=True, blank=True, verbose_name="Fecha de fin")
    dosage = models.CharField(max_length=100, blank=True, verbose_name="Dosis")
    applied_by = models.CharField(max_length=100, blank=True, verbose_name="Aplicado por")
    diagnosis = models.TextField(blank=True, verbose_name="Diagnóstico")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Tratamiento"
        verbose_name_plural = "Tratamientos"
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.pig.ear_tag} - {self.medication} ({self.start_date})"


class MortalityCause(models.TextChoices):
    DISEASE = "disease", "Enfermedad"
    CRUSHED = "crushed", "Aplastamiento"
    DIARRHEA = "diarrhea", "Diarrea"
    RESPIRATORY = "respiratory", "Problema respiratorio"
    CONGENITAL = "congenital", "Malformación congénita"
    TRAUMA = "trauma", "Traumatismo"
    UNKNOWN = "unknown", "Causa desconocida"
    OTHER = "other", "Otro"


class MortalityRecord(models.Model):
    pig = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="mortality_records", verbose_name="Cerdo")
    death_date = models.DateField(verbose_name="Fecha de muerte")
    cause = models.CharField(max_length=20, choices=MortalityCause.choices, default=MortalityCause.UNKNOWN, verbose_name="Causa")
    age_days = models.PositiveIntegerField(editable=False, verbose_name="Edad (días)")
    necropsy_performed = models.BooleanField(default=False, verbose_name="¿Necropsia realizada?")
    necropsy_results = models.TextField(blank=True, verbose_name="Resultados de necropsia")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Registro de mortalidad"
        verbose_name_plural = "Registros de mortalidad"
        ordering = ["-death_date"]

    def save(self, *args, **kwargs):
        if self.pig.birth_date:
            self.age_days = (self.death_date - self.pig.birth_date).days
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pig.ear_tag} - Muerto {self.death_date} ({self.get_cause_display()})"
