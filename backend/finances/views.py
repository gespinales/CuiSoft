from rest_framework import viewsets, permissions
from .models import WorkerPayment, Expense
from .serializers import WorkerPaymentSerializer, ExpenseSerializer


class WorkerPaymentViewSet(viewsets.ModelViewSet):
    queryset = WorkerPayment.objects.all()
    serializer_class = WorkerPaymentSerializer
    search_fields = ["worker_name", "notes"]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    filterset_fields = ["category"]
    search_fields = ["description", "notes"]
