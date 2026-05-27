from django.contrib import admin
from .models import HeatDetection, Mating, Gestation, Farrowing, PigletBatch, Weaning

admin.site.register(HeatDetection)
admin.site.register(Mating)
admin.site.register(Gestation)
admin.site.register(Farrowing)
admin.site.register(PigletBatch)
admin.site.register(Weaning)
