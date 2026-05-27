from datetime import timedelta
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from animals.models import Pig
from .models import HeatDetection, Mating, Gestation, Farrowing, PigletBatch, Weaning
from .serializers import (
    HeatDetectionSerializer, MatingSerializer, GestationSerializer,
    FarrowingSerializer, PigletBatchSerializer, WeaningSerializer,
)


class HeatDetectionViewSet(viewsets.ModelViewSet):
    queryset = HeatDetection.objects.select_related("sow").all()
    serializer_class = HeatDetectionSerializer
    filterset_fields = ["sow", "is_mated", "intensity"]
    search_fields = ["sow__ear_tag", "notes"]


class MatingViewSet(viewsets.ModelViewSet):
    queryset = Mating.objects.select_related("sow", "boar").all()
    serializer_class = MatingSerializer
    filterset_fields = ["sow", "boar", "mating_type", "is_successful"]
    search_fields = ["sow__ear_tag", "boar__ear_tag", "notes"]

    def _auto_create_gestation(self, mating):
        if mating.is_successful is False:
            return
        existing = Gestation.objects.filter(sow=mating.sow, status__in=["suspected", "confirmed"]).first()
        if existing:
            return
        start = mating.mating_date
        expected = start + timedelta(days=114)
        Gestation.objects.create(
            sow=mating.sow,
            mating=mating,
            start_date=start,
            expected_farrowing_date=expected,
        )

    def perform_create(self, serializer):
        mating = serializer.save()
        self._auto_create_gestation(mating)

    def perform_update(self, serializer):
        mating = serializer.save()
        self._auto_create_gestation(mating)


class GestationViewSet(viewsets.ModelViewSet):
    queryset = Gestation.objects.select_related("sow", "mating").all()
    serializer_class = GestationSerializer
    filterset_fields = ["sow", "status"]
    search_fields = ["sow__ear_tag", "notes"]


class FarrowingViewSet(viewsets.ModelViewSet):
    queryset = Farrowing.objects.select_related("sow", "gestation").prefetch_related("piglet_batches").all()
    serializer_class = FarrowingSerializer
    filterset_fields = ["sow", "farrowing_date"]
    search_fields = ["sow__ear_tag", "notes"]


class PigletBatchViewSet(viewsets.ModelViewSet):
    queryset = PigletBatch.objects.select_related("farrowing").all()
    serializer_class = PigletBatchSerializer
    filterset_fields = ["farrowing"]


class WeaningViewSet(viewsets.ModelViewSet):
    queryset = Weaning.objects.select_related("sow", "farrowing").all()
    serializer_class = WeaningSerializer
    filterset_fields = ["sow", "farrowing"]
    search_fields = ["sow__ear_tag", "notes"]


class SowReproductionSummaryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        sows = Pig.objects.filter(sex="female", category="sow", status="active")
        data = []
        for sow in sows:
            last_farrowing = sow.farrowings.order_by("-farrowing_date").first()
            last_mating = sow.matings.order_by("-mating_date").first()
            active_gestation = sow.gestations.filter(status__in=["suspected", "confirmed"]).last()
            data.append({
                "sow_id": sow.id,
                "ear_tag": sow.ear_tag,
                "last_mating_date": last_mating.mating_date if last_mating else None,
                "last_farrowing_date": last_farrowing.farrowing_date if last_farrowing else None,
                "piglets_alive": last_farrowing.piglets_alive if last_farrowing else 0,
                "is_pregnant": active_gestation is not None,
                "expected_farrowing": active_gestation.expected_farrowing_date if active_gestation else None,
                "location": sow.location.name if sow.location else None,
            })
        return Response(data)
