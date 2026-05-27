from rest_framework import serializers
from .models import Breed, Location, Pig, WeightRecord


class BreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Breed
        fields = "__all__"


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = "__all__"


class PigListSerializer(serializers.ModelSerializer):
    breed_name = serializers.CharField(source="breed.name", read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    age_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pig
        fields = [
            "id", "ear_tag", "name", "breed", "breed_name",
            "birth_date", "age_days", "sex", "category", "status",
            "location", "location_name", "mother", "father",
            "entry_date", "notes",
        ]


class PigDetailSerializer(serializers.ModelSerializer):
    breed_name = serializers.CharField(source="breed.name", read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)

    class Meta:
        model = Pig
        fields = "__all__"


class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = "__all__"


class WeightRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ["pig", "weight_kg", "date", "notes"]
