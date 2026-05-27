from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedTypeViewSet, FeedInventoryViewSet, FeedConsumptionViewSet, DietViewSet, FeedStockViewSet

router = DefaultRouter()
router.register(r"feed-types", FeedTypeViewSet)
router.register(r"inventory", FeedInventoryViewSet)
router.register(r"consumption", FeedConsumptionViewSet)
router.register(r"diets", DietViewSet)
router.register(r"stock", FeedStockViewSet, basename="feed-stock")

urlpatterns = [
    path("", include(router.urls)),
]
