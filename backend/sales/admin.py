from django.contrib import admin
from .models import Customer, Sale, SaleItem, GrowOutBatch, GrowOutPig

admin.site.register(Customer)
admin.site.register(Sale)
admin.site.register(SaleItem)
admin.site.register(GrowOutBatch)
admin.site.register(GrowOutPig)
