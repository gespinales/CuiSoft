from rest_framework import serializers
from .models import HeatDetection, Mating, Gestation, Farrowing, PigletBatch, Weaning


class HeatDetectionSerializer(serializers.ModelSerializer):
    sow_name = serializers.CharField(source="sow.ear_tag", read_only=True)
    intensity_display = serializers.CharField(source="get_intensity_display", read_only=True)

    class Meta:
        model = HeatDetection
        fields = "__all__"


class MatingSerializer(serializers.ModelSerializer):
    sow_name = serializers.CharField(source="sow.ear_tag", read_only=True)
    boar_name = serializers.CharField(source="boar.ear_tag", read_only=True, allow_null=True)

    class Meta:
        model = Mating
        fields = "__all__"


class GestationSerializer(serializers.ModelSerializer):
    sow_name = serializers.CharField(source="sow.ear_tag", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Gestation
        fields = "__all__"


class PigletBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PigletBatch
        fields = "__all__"


class FarrowingSerializer(serializers.ModelSerializer):
    sow_name = serializers.CharField(source="sow.ear_tag", read_only=True)
    piglet_batches = PigletBatchSerializer(many=True, read_only=True)

    class Meta:
        model = Farrowing
        fields = "__all__"


class WeaningSerializer(serializers.ModelSerializer):
    sow_name = serializers.CharField(source="sow.ear_tag", read_only=True)

    class Meta:
        model = Weaning
        fields = "__all__"
