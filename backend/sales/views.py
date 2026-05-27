from rest_framework import viewsets
from .models import Customer, Sale, SaleItem, GrowOutBatch, GrowOutPig
from .serializers import (
    CustomerSerializer, SaleSerializer, SaleItemSerializer,
    GrowOutBatchSerializer, GrowOutPigSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    search_fields = ["name", "phone", "email"]


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related("customer").prefetch_related("items").all()
    serializer_class = SaleSerializer
    filterset_fields = ["status", "sale_date", "customer"]
    search_fields = ["customer__name", "notes"]


class SaleItemViewSet(viewsets.ModelViewSet):
    queryset = SaleItem.objects.select_related("sale", "pig").all()
    serializer_class = SaleItemSerializer
    filterset_fields = ["sale"]


class GrowOutBatchViewSet(viewsets.ModelViewSet):
    queryset = GrowOutBatch.objects.prefetch_related("pigs__pig").all()
    serializer_class = GrowOutBatchSerializer
    search_fields = ["name", "notes"]


class GrowOutPigViewSet(viewsets.ModelViewSet):
    queryset = GrowOutPig.objects.select_related("batch", "pig").all()
    serializer_class = GrowOutPigSerializer
    filterset_fields = ["batch", "pig"]
