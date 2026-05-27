from django.contrib import admin
from .models import Vaccine, VaccinationSchedule, VaccinationScheduleItem, VaccinationRecord, Treatment, MortalityRecord

admin.site.register(Vaccine)
admin.site.register(VaccinationSchedule)
admin.site.register(VaccinationScheduleItem)
admin.site.register(VaccinationRecord)
admin.site.register(Treatment)
admin.site.register(MortalityRecord)
