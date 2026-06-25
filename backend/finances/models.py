from django.db import models
from django.core.validators import MinValueValidator


class PaymentFrequency(models.TextChoices):
    WEEKLY = "weekly", "Semanal"
    BIWEEKLY = "biweekly", "Quincenal"
    MONTHLY = "monthly", "Mensual"


class ExpenseCategory(models.TextChoices):
    WORKER = "worker", "Pago de trabajador"
    FEED = "feed", "Alimento"
    HEALTH = "health", "Salud"
    SERVICES = "services", "Servicios"
    MAINTENANCE = "maintenance", "Mantenimiento"
    OTHER = "other", "Otros"


class WorkerPayment(models.Model):
    worker_name = models.CharField(max_length=200, verbose_name="Nombre del trabajador")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Monto")
    payment_date = models.DateField(verbose_name="Fecha de pago")
    frequency = models.CharField(max_length=20, choices=PaymentFrequency.choices, verbose_name="Frecuencia")
    period_start = models.DateField(verbose_name="Inicio del período")
    period_end = models.DateField(verbose_name="Fin del período")
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices, default=ExpenseCategory.WORKER, verbose_name="Categoría")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Pago a trabajador"
        verbose_name_plural = "Pagos a trabajadores"
        ordering = ["-payment_date"]

    def __str__(self):
        return f"{self.worker_name} - Q{self.amount} ({self.payment_date})"


class Expense(models.Model):
    description = models.CharField(max_length=300, verbose_name="Descripción")
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], verbose_name="Monto")
    date = models.DateField(verbose_name="Fecha")
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices, default=ExpenseCategory.OTHER, verbose_name="Categoría")
    notes = models.TextField(blank=True, verbose_name="Notas")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Gasto"
        verbose_name_plural = "Gastos"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.description} - Q{self.amount} ({self.date})"
