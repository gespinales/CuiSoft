from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SaleViewSet, SaleItemViewSet, GrowOutBatchViewSet, GrowOutPigViewSet

router = DefaultRouter()
router.register(r"customers", CustomerViewSet)
router.register(r"sales", SaleViewSet)
router.register(r"sale-items", SaleItemViewSet)
router.register(r"grow-out-batches", GrowOutBatchViewSet)
router.register(r"grow-out-pigs", GrowOutPigViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
