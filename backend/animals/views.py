from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Breed, Location, Pig, WeightRecord, PigCategory, PigStatus, Sex
from .serializers import (
    BreedSerializer, LocationSerializer,
    PigListSerializer, PigDetailSerializer,
    WeightRecordSerializer, WeightRecordCreateSerializer,
)


class BreedViewSet(viewsets.ModelViewSet):
    queryset = Breed.objects.all()
    serializer_class = BreedSerializer
    search_fields = ["name"]


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    search_fields = ["name", "code"]


class PigFilter(filters.FilterSet):
    category = filters.ChoiceFilter(choices=PigCategory.choices)
    status = filters.ChoiceFilter(choices=PigStatus.choices)
    sex = filters.ChoiceFilter(choices=Sex.choices)
    breed = filters.NumberFilter()
    location = filters.NumberFilter()
    birth_date_after = filters.DateFilter(field_name="birth_date", lookup_expr="gte")
    birth_date_before = filters.DateFilter(field_name="birth_date", lookup_expr="lte")

    class Meta:
        model = Pig
        fields = ["category", "status", "sex", "breed", "location"]


class PigViewSet(viewsets.ModelViewSet):
    queryset = Pig.objects.select_related("breed", "location").all()
    filterset_class = PigFilter
    search_fields = ["ear_tag", "name", "notes"]

    def get_serializer_class(self):
        if self.action == "list":
            return PigListSerializer
        return PigDetailSerializer

    @action(detail=True, methods=["get"])
    def weights(self, request, pk=None):
        pig = self.get_object()
        weights = pig.weights.all()
        serializer = WeightRecordSerializer(weights, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def offspring(self, request, pk=None):
        pig = self.get_object()
        children = Pig.objects.filter(mother=pig) | Pig.objects.filter(father=pig)
        serializer = PigListSerializer(children.distinct(), many=True)
        return Response(serializer.data)


class WeightRecordViewSet(viewsets.ModelViewSet):
    queryset = WeightRecord.objects.select_related("pig").all()
    search_fields = ["pig__ear_tag", "notes"]

    def get_serializer_class(self):
        if self.action == "create":
            return WeightRecordCreateSerializer
        return WeightRecordSerializer
