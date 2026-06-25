from django.db import models
from django.core.validators import MinValueValidator
from animals.models import PigCategory, SowStatus


class FeedType(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre")
    supplier = models.CharField(max_length=200, blank=True, verbose_name="Proveedor")
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name="Costo unitario")
    unit_measure = models.CharField(max_length=50, default="kg", verbose_name="Unidad de medida")
    description = models.TextField(blank=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Tipo de alimento"
        verbose_name_plural = "Tipos de alimento"

    def __str__(self):
        return self.name


class FeedInventory(models.Model):
    feed_type = models.ForeignKey(FeedType, on_delete=models.CASCADE, related_name="inventory_items", verbose_name="Alimento")
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name="Cantidad en stock")
    entry_date = models.DateField(verbose_name="Fecha de ingreso")
    expiration_date = models.DateField(null=True, blank=True, verbose_name="Fecha de vencimiento")
    batch_number = models.CharField(max_length=100, blank=True, verbose_name="Lote")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventario de alimento"
        verbose_name_plural = "Inventarios de alimento"
        ordering = ["-entry_date"]

    def __str__(self):
        return f"{self.feed_type.name} - {self.stock_quantity} {self.feed_type.unit_measure}"


class FeedConsumption(models.Model):
    feed_type = models.ForeignKey(FeedType, on_delete=models.CASCADE, verbose_name="Alimento")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Cantidad")
    date = models.DateField(verbose_name="Fecha")
    location = models.ForeignKey("animals.Location", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ubicación")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Consumo de alimento"
        verbose_name_plural = "Consumos de alimento"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.feed_type.name} - {self.quantity} ({self.date})"


class Diet(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre de dieta")
    description = models.TextField(blank=True, verbose_name="Descripción")
    feed_type = models.ForeignKey(FeedType, on_delete=models.CASCADE, verbose_name="Alimento")
    pig_category = models.CharField(max_length=20, choices=PigCategory.choices, verbose_name="Categoría de cerdo")
    sow_status = models.CharField(max_length=20, choices=SowStatus.choices, null=True, blank=True, verbose_name="Estado reproductivo (solo cerdas)")
    daily_amount_per_pig = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Cantidad diaria por cerdo")
    min_age_days = models.PositiveIntegerField(default=0, verbose_name="Edad mínima (días)")
    max_age_days = models.PositiveIntegerField(null=True, blank=True, verbose_name="Edad máxima (días)")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Dieta"
        verbose_name_plural = "Dietas"
        unique_together = ["feed_type", "pig_category", "sow_status"]

    def __str__(self):
        label = self.get_pig_category_display()
        if self.sow_status:
            label += f" ({self.get_sow_status_display()})"
        return f"{self.name} - {label} ({self.daily_amount_per_pig} {self.feed_type.unit_measure}/día)"
