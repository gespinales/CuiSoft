from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VaccineViewSet, VaccinationScheduleViewSet, VaccinationScheduleItemViewSet,
    VaccinationRecordViewSet, TreatmentViewSet, MortalityRecordViewSet,
)

router = DefaultRouter()
router.register(r"vaccines", VaccineViewSet)
router.register(r"schedules", VaccinationScheduleViewSet)
router.register(r"schedule-items", VaccinationScheduleItemViewSet)
router.register(r"records", VaccinationRecordViewSet)
router.register(r"treatments", TreatmentViewSet)
router.register(r"mortality", MortalityRecordViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
