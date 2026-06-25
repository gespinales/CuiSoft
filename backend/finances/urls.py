from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerPaymentViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r"worker-payments", WorkerPaymentViewSet)
router.register(r"expenses", ExpenseViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
