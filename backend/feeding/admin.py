from django.contrib import admin
from .models import FeedType, FeedInventory, FeedConsumption, Diet

admin.site.register(FeedType)
admin.site.register(FeedInventory)
admin.site.register(FeedConsumption)
admin.site.register(Diet)
