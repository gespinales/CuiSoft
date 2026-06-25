from datetime import date, timedelta
from django.db.models import Sum, F, DecimalField, Value
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from animals.models import Pig, PigCategory, SowStatus
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
    queryset = FeedConsumption.objects.select_related("feed_type", "location").all()
    serializer_class = FeedConsumptionSerializer
    filterset_fields = ["feed_type", "location", "date"]
    search_fields = ["feed_type__name", "notes"]


class DietViewSet(viewsets.ModelViewSet):
    queryset = Diet.objects.select_related("feed_type").all()
    serializer_class = DietSerializer
    search_fields = ["name"]


class FeedStockViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    QQ_TO_LB = 100
    LEAD_TIME_DAYS = 7

    def _totals(self, feed_type):
        total_in_qq = float(FeedInventory.objects.filter(feed_type=feed_type).aggregate(
            total=Coalesce(Sum("stock_quantity"), 0, output_field=DecimalField())
        )["total"])
        total_out_lb = float(FeedConsumption.objects.filter(feed_type=feed_type).aggregate(
            total=Coalesce(Sum("quantity"), 0, output_field=DecimalField())
        )["total"])
        available_lb = (total_in_qq * self.QQ_TO_LB) - total_out_lb
        return total_in_qq, total_out_lb, available_lb

    def list(self, request):
        types = FeedType.objects.filter(is_active=True)
        data = []
        for ft in types:
            total_in_qq, total_out_lb, available_lb = self._totals(ft)
            data.append({
                "id": ft.id,
                "name": ft.name,
                "supplier": ft.supplier,
                "unit_cost": float(ft.unit_cost),
                "total_entered_qq": total_in_qq,
                "total_consumed_lb": total_out_lb,
                "available_lb": round(available_lb, 2),
                "available_qq": round(available_lb / self.QQ_TO_LB, 2),
                "stock_value": round((available_lb / self.QQ_TO_LB) * float(ft.unit_cost), 2),
            })
        return Response(data)

    @action(detail=False, methods=["get"])
    def projections(self, request):
        pigs_by_category = {
            cat: Pig.objects.filter(status="active", category=cat).count()
            for cat, _ in PigCategory.choices
        }
        sows_by_status = {
            st: Pig.objects.filter(status="active", category="sow", sow_status=st).count()
            for st, _ in SowStatus.choices
        }

        types = FeedType.objects.filter(is_active=True)
        data = []
        for ft in types:
            _, _, available_lb = self._totals(ft)

            diets = Diet.objects.filter(feed_type=ft, is_active=True)
            daily_total_lb = 0
            details = []
            for diet in diets:
                if diet.pig_category == "sow" and diet.sow_status:
                    count = sows_by_status.get(diet.sow_status, 0)
                else:
                    count = pigs_by_category.get(diet.pig_category, 0)
                if count > 0:
                    daily = float(diet.daily_amount_per_pig) * count
                    daily_total_lb += daily
                    label = diet.get_pig_category_display()
                    if diet.sow_status:
                        label += f" ({diet.get_sow_status_display()})"
                    details.append({
                        "category": diet.pig_category,
                        "category_display": label,
                        "pig_count": count,
                        "diet_name": diet.name,
                        "daily_per_pig_lb": float(diet.daily_amount_per_pig),
                        "daily_total_lb": round(daily, 2),
                    })

            days_remaining = round(available_lb / daily_total_lb, 1) if daily_total_lb > 0 else None
            restock_date = None
            if days_remaining is not None:
                restock = date.today() + timedelta(days=int(days_remaining - self.LEAD_TIME_DAYS))
                restock_date = restock.strftime("%d/%m/%Y")

            data.append({
                "id": ft.id,
                "name": ft.name,
                "available_lb": round(available_lb, 2),
                "daily_consumption_estimate_lb": round(daily_total_lb, 2),
                "days_remaining": days_remaining,
                "lead_time_days": self.LEAD_TIME_DAYS,
                "suggested_restock_date": restock_date,
                "details": details,
                "total_pigs": sum(pigs_by_category.values()),
            })
        return Response(data)
