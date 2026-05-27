from django.contrib import admin
from .models import Breed, Location, Pig, WeightRecord

admin.site.register(Breed)
admin.site.register(Location)
admin.site.register(Pig)
admin.site.register(WeightRecord)
