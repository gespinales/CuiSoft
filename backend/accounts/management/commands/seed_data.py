from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from animals.models import Breed, Location, Pig, SowStatus
from health.models import Vaccine
from feeding.models import FeedType
from sales.models import Customer

User = get_user_model()


class Command(BaseCommand):
    help = "Crea datos iniciales y de prueba para el sistema"

    def handle(self, *args, **options):
        # Usuarios
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(username="admin", email="admin@pigfarm.com", password="admin123", role="admin", first_name="Admin")
            self.stdout.write(self.style.SUCCESS("Superusuario 'admin' creado"))
        if not User.objects.filter(username="veterinario").exists():
            User.objects.create_user(username="veterinario", email="vet@pigfarm.com", password="vet123", role="veterinarian", first_name="Veterinario")
            self.stdout.write(self.style.SUCCESS("Usuario 'veterinario' creado"))
        if not User.objects.filter(username="encargado").exists():
            User.objects.create_user(username="encargado", password="enc123", role="manager", first_name="Carlos", last_name="López")
            self.stdout.write(self.style.SUCCESS("Usuario 'encargado' creado"))

        # Razas
        breeds_data = ["Yorkshire", "Landrace", "Duroc", "Pietrain", "Large White", "Hampshire"]
        for name in breeds_data:
            Breed.objects.get_or_create(name=name)
        york = Breed.objects.get(name="Yorkshire")
        land = Breed.objects.get(name="Landrace")
        duroc = Breed.objects.get(name="Duroc")

        # Ubicaciones
        locs_data = [
            {"name": "Gestación 1", "code": "GEST-01", "capacity": 50},
            {"name": "Gestación 2", "code": "GEST-02", "capacity": 50},
            {"name": "Maternidad 1", "code": "MAT-01", "capacity": 30},
            {"name": "Maternidad 2", "code": "MAT-02", "capacity": 30},
            {"name": "Destete", "code": "DEST-01", "capacity": 200},
            {"name": "Engorde 1", "code": "ENG-01", "capacity": 100},
            {"name": "Engorde 2", "code": "ENG-02", "capacity": 100},
            {"name": "Cuarentena", "code": "CUAR-01", "capacity": 20},
            {"name": "Padrillos", "code": "PAD-01", "capacity": 10},
        ]
        for loc in locs_data:
            Location.objects.get_or_create(name=loc["name"], defaults=loc)
        gest1 = Location.objects.get(code="GEST-01")
        gest2 = Location.objects.get(code="GEST-02")
        mat1 = Location.objects.get(code="MAT-01")
        pad = Location.objects.get(code="PAD-01")
        dest = Location.objects.get(code="DEST-01")
        eng1 = Location.objects.get(code="ENG-01")

        # Vacunas
        vaccines_data = [
            {"name": "Circovirus PCV2", "laboratory": "Zoetis"},
            {"name": "Mycoplasma Hyopneumoniae", "laboratory": "Boehringer"},
            {"name": "Peste Porcina Clásica", "laboratory": "LANA"},
            {"name": "Fiebre Aftosa", "laboratory": "MSD"},
            {"name": "Parvovirus + Leptospira", "laboratory": "Zoetis"},
            {"name": "Erysipelothrix", "laboratory": "MSD"},
        ]
        for v in vaccines_data:
            Vaccine.objects.get_or_create(name=v["name"], defaults=v)

        # Tipos de alimento
        feeds_data = [
            {"name": "Iniciador (0-21 días)", "supplier": "Purina", "unit_cost": 18.50},
            {"name": "Preiniciador (21-42 días)", "supplier": "Purina", "unit_cost": 16.00},
            {"name": "Crecimiento (42-70 días)", "supplier": "Cargill", "unit_cost": 12.50},
            {"name": "Engorde Final", "supplier": "Cargill", "unit_cost": 10.00},
            {"name": "Gestación", "supplier": "Purina", "unit_cost": 11.00},
            {"name": "Lactancia", "supplier": "Purina", "unit_cost": 14.50},
        ]
        for f in feeds_data:
            FeedType.objects.get_or_create(name=f["name"], defaults=f)

        # Clientes
        customers_data = [
            {"name": "Carnes Selectas S.A.", "phone": "8888-0001"},
            {"name": "José Antonio Ruiz", "phone": "8111-0002"},
            {"name": "Cooperativa San Isidro", "phone": "8222-0003"},
            {"name": "María Eugenia Pérez", "phone": "8333-0004"},
        ]
        for c in customers_data:
            Customer.objects.get_or_create(name=c["name"], defaults=c)

        # Cerdas madres
        sows_data = [
            {"ear_tag": "CM-001", "breed": york, "birth_date": date(2022, 3, 15), "location": gest1, "notes": "Buena madre, partos sin problemas"},
            {"ear_tag": "CM-002", "breed": land, "birth_date": date(2022, 6, 20), "location": gest1, "notes": "Alta prolificidad"},
            {"ear_tag": "CM-003", "breed": york, "birth_date": date(2022, 2, 10), "location": mat1},
            {"ear_tag": "CM-004", "breed": duroc, "birth_date": date(2023, 1, 5), "location": gest2 if Location.objects.filter(code="GEST-02").exists() else gest1},
            {"ear_tag": "CM-005", "breed": land, "birth_date": date(2022, 8, 12), "location": gest1, "notes": "Reemplazo joven"},
            {"ear_tag": "CM-006", "breed": york, "birth_date": date(2023, 5, 30), "location": gest1},
            {"ear_tag": "CM-007", "breed": duroc, "birth_date": date(2023, 3, 22), "location": gest2 if Location.objects.filter(code="GEST-02").exists() else gest1},
            {"ear_tag": "CM-008", "breed": land, "birth_date": date(2022, 11, 8), "location": gest1, "notes": "Problemas de patas en último parto"},
        ]
        sows = []
        for i, s in enumerate(sows_data):
            pig, created = Pig.objects.get_or_create(ear_tag=s["ear_tag"], defaults={
                "sex": "female", "category": "sow", "status": "active",
                "sow_status": "empty",
                "breed": s["breed"], "birth_date": s["birth_date"],
                "location": s["location"], "notes": s.get("notes", ""),
            })
            sows.append(pig)
        # Asignar estado reproductivo a las primeras cerdas de ejemplo
        if sows:
            sows[0].sow_status = "gestating"
            sows[0].save(update_fields=["sow_status"])
        if len(sows) > 1:
            sows[1].sow_status = "lactating"
            sows[1].save(update_fields=["sow_status"])

        # Verracos
        boars_data = [
            {"ear_tag": "VR-001", "breed": duroc, "birth_date": date(2021, 9, 10), "location": pad, "notes": "Verraco principal"},
            {"ear_tag": "VR-002", "breed": york, "birth_date": date(2022, 4, 15), "location": pad},
        ]
        for b in boars_data:
            Pig.objects.get_or_create(ear_tag=b["ear_tag"], defaults={
                "sex": "male", "category": "boar", "status": "active",
                "breed": b["breed"], "birth_date": b["birth_date"],
                "location": b["location"], "notes": b.get("notes", ""),
            })

        # Lechones (crear algunos para un lote reciente)
        if not Pig.objects.filter(ear_tag="LECH-001").exists():
            for i in range(1, 9):
                Pig.objects.create(
                    ear_tag=f"LECH-00{i}",
                    sex="male" if i % 2 == 0 else "female",
                    category="piglet",
                    status="active",
                    birth_date=date.today() - timedelta(days=20),
                    location=dest,
                    mother=sows[0],
                )

        # Cerdos de engorde
        if not Pig.objects.filter(ear_tag="ENG-001").exists():
            for i in range(1, 7):
                Pig.objects.create(
                    ear_tag=f"ENG-00{i}",
                    sex="male",
                    category="grower",
                    status="active",
                    birth_date=date.today() - timedelta(days=90),
                    location=eng1,
                )

        # Dietas por categoría (cantidades en libras/cerdo/día)
        from feeding.models import FeedInventory, FeedConsumption, Diet
        dietas_data = [
            {"name": "Gestación", "feed_type": FeedType.objects.get(name="Gestación"), "pig_category": "sow", "sow_status": "gestating", "daily_amount_per_pig": 5.5},
            {"name": "Lactancia", "feed_type": FeedType.objects.get(name="Lactancia"), "pig_category": "sow", "sow_status": "lactating", "daily_amount_per_pig": 11.0},
            {"name": "Padrillo", "feed_type": FeedType.objects.get(name="Gestación"), "pig_category": "boar", "sow_status": None, "daily_amount_per_pig": 5.5},
            {"name": "Iniciador Lechones", "feed_type": FeedType.objects.get(name="Iniciador (0-21 días)"), "pig_category": "piglet", "sow_status": None, "daily_amount_per_pig": 0.7},
            {"name": "Preiniciador", "feed_type": FeedType.objects.get(name="Preiniciador (21-42 días)"), "pig_category": "piglet", "sow_status": None, "daily_amount_per_pig": 1.1},
            {"name": "Engorde", "feed_type": FeedType.objects.get(name="Engorde Final"), "pig_category": "grower", "sow_status": None, "daily_amount_per_pig": 6.6},
            {"name": "Reemplazo", "feed_type": FeedType.objects.get(name="Crecimiento (42-70 días)"), "pig_category": "replacement", "sow_status": None, "daily_amount_per_pig": 4.4},
        ]
        # Limpiar dietas viejas de cerdas sin sow_status (cambio de esquema)
        Diet.objects.filter(pig_category="sow", sow_status__isnull=True).delete()
        for d in dietas_data:
            Diet.objects.update_or_create(
                feed_type=d["feed_type"], pig_category=d["pig_category"],
                sow_status=d.get("sow_status"),
                defaults=d,
            )

        # Alimentación - inventario (cantidades en quintales)
        today = date.today()
        for ft in FeedType.objects.all():
            if not FeedInventory.objects.filter(feed_type=ft).exists():
                FeedInventory.objects.create(
                    feed_type=ft,
                    stock_quantity=50,
                    entry_date=today - timedelta(days=30),
                )

        # Alimentación - consumo (cantidades en libras)
        if not FeedConsumption.objects.exists():
            for ft in FeedType.objects.all()[:3]:
                FeedConsumption.objects.create(
                    feed_type=ft,
                    quantity=250,
                    date=today - timedelta(days=1),
                )

        # Pagos a trabajadores
        from finances.models import WorkerPayment
        if not WorkerPayment.objects.exists():
            WorkerPayment.objects.create(
                worker_name="Carlos López",
                amount=350,
                payment_date=today - timedelta(days=2),
                frequency="weekly",
                period_start=today - timedelta(days=9),
                period_end=today - timedelta(days=2),
            )

        self.stdout.write(self.style.SUCCESS(f"Datos de prueba creados: {Pig.objects.count()} cerdos, {Breed.objects.count()} razas, {Location.objects.count()} ubicaciones"))
