from django.db.models import Sum, F, DecimalField, Value
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FeedType, FeedInventory, FeedConsumption, Diet
from .serializers import (
    FeedTypeSerializer, FeedInventorySerializer,
    FeedConsumptionSerializer, DietSerializer,
)


class FeedTypeViewSet(viewsets.ModelViewSet):
    queryset = FeedType.objects.all()
    serializer_class = FeedTypeSerializer
    search_fields = ["name", "supplier"]


class FeedInventoryViewSet(viewsets.ModelViewSet):
    queryset = FeedInventory.objects.select_related("feed_type").all()
    serializer_class = FeedInventorySerializer
    filterset_fields = ["feed_type"]
    search_fields = ["feed_type__name", "batch_number"]


class FeedConsumptionViewSet(viewsets.ModelViewSet):
    queryset = FeedConsumption.objects.select_related("feed_type", "pig", "location").all()
    serializer_class = FeedConsumptionSerializer
    filterset_fields = ["feed_type", "pig", "location", "date"]
    search_fields = ["feed_type__name", "notes"]


class DietViewSet(viewsets.ModelViewSet):
    queryset = Diet.objects.select_related("feed_type").all()
    serializer_class = DietSerializer
    search_fields = ["name"]


class FeedStockViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        types = FeedType.objects.filter(is_active=True)
        data = []
        for ft in types:
            total_in = FeedInventory.objects.filter(feed_type=ft).aggregate(
                total=Coalesce(Sum("stock_quantity"), 0, output_field=DecimalField())
            )["total"]
            total_out = FeedConsumption.objects.filter(feed_type=ft).aggregate(
                total=Coalesce(Sum("quantity"), 0, output_field=DecimalField())
            )["total"]
            available = float(total_in) - float(total_out)
            data.append({
                "id": ft.id,
                "name": ft.name,
                "supplier": ft.supplier,
                "unit_cost": float(ft.unit_cost),
                "total_entered": float(total_in),
                "total_consumed": float(total_out),
                "available": available,
                "stock_value": round(available * float(ft.unit_cost), 2),
            })
        return Response(data)
