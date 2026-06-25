from django.core.management.base import BaseCommand
from animals.models import Pig


class Command(BaseCommand):
    help = "Elimina los datos semilla de lechones (LECH-*) y cerdos de engorde (ENG-*)"

    def handle(self, *args, **options):
        lechones = Pig.objects.filter(ear_tag__startswith="LECH-")
        engorde = Pig.objects.filter(ear_tag__startswith="ENG-")

        count_lechones = lechones.count()
        count_engorde = engorde.count()

        # Delete related records first (if any)
        for pig in lechones:
            pig.weights.all().delete()
        for pig in engorde:
            pig.weights.all().delete()

        lechones.delete()
        engorde.delete()

        self.stdout.write(self.style.SUCCESS(
            f"Eliminados {count_lechones} lechones y {count_engorde} cerdos de engorde"
        ))
