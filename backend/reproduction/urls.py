from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeatDetectionViewSet, MatingViewSet, GestationViewSet,
    FarrowingViewSet, PigletBatchViewSet, WeaningViewSet,
    SowReproductionSummaryViewSet,
)

router = DefaultRouter()
router.register(r"heat-detections", HeatDetectionViewSet)
router.register(r"matings", MatingViewSet)
router.register(r"gestations", GestationViewSet)
router.register(r"farrowings", FarrowingViewSet)
router.register(r"piglet-batches", PigletBatchViewSet)
router.register(r"weanings", WeaningViewSet)
router.register(r"sow-summary", SowReproductionSummaryViewSet, basename="sow-summary")

urlpatterns = [
    path("", include(router.urls)),
]
