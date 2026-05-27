from datetime import timedelta
from django.db.models import Count, Sum, Avg, Q, F, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from animals.models import Pig, WeightRecord
from reproduction.models import Farrowing, Weaning
from health.models import MortalityRecord, VaccinationRecord
from feeding.models import FeedInventory, FeedType, FeedConsumption
from sales.models import Sale


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)

        total_sows = Pig.objects.filter(sex="female", category="sow").count()
        active_sows = Pig.objects.filter(sex="female", category="sow", status="active").count()
        pregnant_sows = Pig.objects.filter(
            sex="female", category="sow", status="active",
            gestations__status__in=["suspected", "confirmed"],
        ).distinct().count()
        total_boars = Pig.objects.filter(sex="male", category="boar").count()
        piglets_last_30 = Farrowing.objects.filter(farrowing_date__gte=last_30).aggregate(
            total=Coalesce(Sum("piglets_alive"), 0, output_field=DecimalField())
        )["total"]
        weaned_last_30 = Weaning.objects.filter(weaning_date__gte=last_30).aggregate(
            total=Coalesce(Sum("piglets_weaned"), 0, output_field=DecimalField())
        )["total"]
        mortality_last_30 = MortalityRecord.objects.filter(death_date__gte=last_30).count()
        active_growers = Pig.objects.filter(category="grower", status="active").count()
        pending_vaccinations = VaccinationRecord.objects.filter(
            next_due_date__lte=today
        ).count()
        feed_stock = FeedInventory.objects.aggregate(
            total=Coalesce(Sum(F("stock_quantity") * F("feed_type__unit_cost")), 0, output_field=DecimalField())
        )["total"]

        total_piglets = Farrowing.objects.aggregate(
            total=Coalesce(Sum("piglets_alive"), 0, output_field=DecimalField())
        )["total"]

        return Response({
            "total_sows": total_sows,
            "active_sows": active_sows,
            "pregnant_sows": pregnant_sows,
            "total_boars": total_boars,
            "total_piglets": total_piglets,
            "piglets_last_30_days": piglets_last_30,
            "weaned_last_30_days": weaned_last_30,
            "mortality_last_30_days": mortality_last_30,
            "active_growers": active_growers,
            "pending_vaccinations": pending_vaccinations,
            "feed_stock_value": feed_stock,
        })

    @action(detail=False, methods=["get"])
    def sow_productivity(self, request):
        sows = Pig.objects.filter(sex="female", category="sow", status="active").annotate(
            total_farrowings=Count("farrowings"),
            total_piglets_alive=Coalesce(Sum("farrowings__piglets_alive"), 0, output_field=DecimalField()),
        )
        data = []
        for sow in sows:
            weaning_data = Weaning.objects.filter(sow=sow).aggregate(
                total_weaned=Coalesce(Sum("piglets_weaned"), 0, output_field=DecimalField())
            )
            last_farrow = sow.farrowings.order_by("-farrowing_date").first()
            last_wean = Weaning.objects.filter(sow=sow).order_by("-weaning_date").first()
            avg_piglets = round(float(sow.total_piglets_alive) / sow.total_farrowings, 1) if sow.total_farrowings > 0 else 0
            data.append({
                "sow_id": sow.id,
                "ear_tag": sow.ear_tag,
                "total_farrowings": sow.total_farrowings,
                "total_piglets_alive": float(sow.total_piglets_alive),
                "avg_piglets_per_farrowing": avg_piglets,
                "total_weaned": float(weaning_data["total_weaned"]),
                "last_farrowing_date": last_farrow.farrowing_date if last_farrow else None,
                "last_weaning_date": last_wean.weaning_date if last_wean else None,
            })
        return Response(data)

    @action(detail=False, methods=["get"])
    def monthly_stats(self, request):
        year = request.query_params.get("year", timezone.now().year)
        monthly_data = []
        for month in range(1, 13):
            farrowings = Farrowing.objects.filter(farrowing_date__year=year, farrowing_date__month=month)
            weanings = Weaning.objects.filter(weaning_date__year=year, weaning_date__month=month)
            mortality = MortalityRecord.objects.filter(death_date__year=year, death_date__month=month)
            sales = Sale.objects.filter(sale_date__year=year, sale_date__month=month, status="completed")
            feed_consumption = FeedConsumption.objects.filter(date__year=year, date__month=month)
            monthly_data.append({
                "month": month,
                "farrowings": farrowings.count(),
                "piglets_born": sum(f.piglets_alive for f in farrowings),
                "weaned": sum(w.piglets_weaned for w in weanings),
                "mortality": mortality.count(),
                "sales_count": sales.count(),
                "sales_amount": float(sum(s.total_amount for s in sales)),
                "feed_consumption": float(sum(c.quantity for c in feed_consumption)),
            })
        return Response(monthly_data)
