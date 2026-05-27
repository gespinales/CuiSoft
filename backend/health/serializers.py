from rest_framework import serializers
from .models import Vaccine, VaccinationSchedule, VaccinationScheduleItem, VaccinationRecord, Treatment, MortalityRecord


class VaccineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccine
        fields = "__all__"


class VaccinationScheduleItemSerializer(serializers.ModelSerializer):
    vaccine_name = serializers.CharField(source="vaccine.name", read_only=True)

    class Meta:
        model = VaccinationScheduleItem
        fields = "__all__"


class VaccinationScheduleSerializer(serializers.ModelSerializer):
    items = VaccinationScheduleItemSerializer(many=True, read_only=True)

    class Meta:
        model = VaccinationSchedule
        fields = "__all__"


class VaccinationRecordSerializer(serializers.ModelSerializer):
    pig_name = serializers.CharField(source="pig.ear_tag", read_only=True)
    vaccine_name = serializers.CharField(source="vaccine.name", read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = "__all__"


class TreatmentSerializer(serializers.ModelSerializer):
    pig_name = serializers.CharField(source="pig.ear_tag", read_only=True)

    class Meta:
        model = Treatment
        fields = "__all__"


class MortalityRecordSerializer(serializers.ModelSerializer):
    pig_name = serializers.CharField(source="pig.ear_tag", read_only=True)

    class Meta:
        model = MortalityRecord
        fields = "__all__"
