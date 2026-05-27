from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BreedViewSet, LocationViewSet, PigViewSet, WeightRecordViewSet

router = DefaultRouter()
router.register(r"breeds", BreedViewSet)
router.register(r"locations", LocationViewSet)
router.register(r"pigs", PigViewSet)
router.register(r"weights", WeightRecordViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
