from django.db import models
from django.core.validators import MinValueValidator
from animals.models import Pig


class Customer(models.Model):
    name = models.CharField(max_length=200, verbose_name="Nombre")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    email = models.EmailField(blank=True, verbose_name="Email")
    address = models.TextField(blank=True, verbose_name="Dirección")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["name"]

    def __str__(self):
        return self.name


class SaleStatus(models.TextChoices):
    PENDING = "pending", "Pendiente"
    COMPLETED = "completed", "Completada"
    CANCELLED = "cancelled", "Cancelada"


class Sale(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="sales", verbose_name="Cliente")
    sale_date = models.DateField(verbose_name="Fecha de venta")
    status = models.CharField(max_length=20, choices=SaleStatus.choices, default=SaleStatus.PENDING, verbose_name="Estado")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name="Monto total")
    payment_method = models.CharField(max_length=50, blank=True, verbose_name="Método de pago")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ["-sale_date"]

    def __str__(self):
        return f"Venta {self.id} - {self.customer.name} ({self.sale_date})"


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items", verbose_name="Venta")
    pig = models.ForeignKey(Pig, on_delete=models.SET_NULL, null=True, blank=True, related_name="sales", verbose_name="Cerdo")
    description = models.CharField(max_length=200, verbose_name="Descripción")
    quantity = models.PositiveIntegerField(default=1, verbose_name="Cantidad")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Precio unitario")
    weight_kg = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)], verbose_name="Peso (kg)")
    line_total = models.DecimalField(max_digits=12, decimal_places=2, editable=False, verbose_name="Total")

    class Meta:
        verbose_name = "Item de venta"
        verbose_name_plural = "Items de venta"

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity}"


class GrowOutBatch(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre del lote")
    start_date = models.DateField(verbose_name="Fecha de inicio")
    pigs_count = models.PositiveIntegerField(verbose_name="Cantidad de cerdos")
    avg_start_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name="Peso inicial promedio")
    location = models.ForeignKey("animals.Location", on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ubicación")
    target_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name="Peso objetivo")
    status = models.CharField(max_length=20, choices=[("growing", "En engorde"), ("finished", "Finalizado"), ("sold", "Vendido")], default="growing", verbose_name="Estado")
    end_date = models.DateField(null=True, blank=True, verbose_name="Fecha de finalización")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Lote de engorde"
        verbose_name_plural = "Lotes de engorde"

    def __str__(self):
        return f"{self.name} - {self.pigs_count} cerdos"


class GrowOutPig(models.Model):
    batch = models.ForeignKey(GrowOutBatch, on_delete=models.CASCADE, related_name="pigs", verbose_name="Lote")
    pig = models.ForeignKey(Pig, on_delete=models.CASCADE, related_name="grow_out_batches", verbose_name="Cerdo")
    entry_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name="Peso de entrada")
    exit_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name="Peso de salida")
    exit_date = models.DateField(null=True, blank=True, verbose_name="Fecha de salida")
    notes = models.TextField(blank=True, verbose_name="Notas")

    class Meta:
        verbose_name = "Cerdo en engorde"
        verbose_name_plural = "Cerdos en engorde"

    def __str__(self):
        return f"{self.pig.ear_tag} - {self.batch.name}"
