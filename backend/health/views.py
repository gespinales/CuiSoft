from rest_framework import viewsets
from .models import Vaccine, VaccinationSchedule, VaccinationScheduleItem, VaccinationRecord, Treatment, MortalityRecord
from .serializers import (
    VaccineSerializer, VaccinationScheduleSerializer, VaccinationScheduleItemSerializer,
    VaccinationRecordSerializer, TreatmentSerializer, MortalityRecordSerializer,
)


class VaccineViewSet(viewsets.ModelViewSet):
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    search_fields = ["name", "laboratory"]


class VaccinationScheduleViewSet(viewsets.ModelViewSet):
    queryset = VaccinationSchedule.objects.prefetch_related("items__vaccine").all()
    serializer_class = VaccinationScheduleSerializer
    search_fields = ["name"]


class VaccinationScheduleItemViewSet(viewsets.ModelViewSet):
    queryset = VaccinationScheduleItem.objects.select_related("vaccine").all()
    serializer_class = VaccinationScheduleItemSerializer
    filterset_fields = ["schedule"]


class VaccinationRecordViewSet(viewsets.ModelViewSet):
    queryset = VaccinationRecord.objects.select_related("pig", "vaccine").all()
    serializer_class = VaccinationRecordSerializer
    filterset_fields = ["pig", "vaccine", "application_date"]
    search_fields = ["pig__ear_tag", "vaccine__name", "notes"]


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.select_related("pig").all()
    serializer_class = TreatmentSerializer
    filterset_fields = ["pig", "treatment_type"]
    search_fields = ["pig__ear_tag", "medication", "diagnosis"]


class MortalityRecordViewSet(viewsets.ModelViewSet):
    queryset = MortalityRecord.objects.select_related("pig").all()
    serializer_class = MortalityRecordSerializer
    filterset_fields = ["pig", "cause", "death_date"]
    search_fields = ["pig__ear_tag", "notes"]
