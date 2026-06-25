from rest_framework import serializers
from .models import FeedType, FeedInventory, FeedConsumption, Diet


class FeedTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedType
        fields = "__all__"


class FeedInventorySerializer(serializers.ModelSerializer):
    feed_type_name = serializers.CharField(source="feed_type.name", read_only=True)

    class Meta:
        model = FeedInventory
        fields = "__all__"


class FeedConsumptionSerializer(serializers.ModelSerializer):
    feed_type_name = serializers.CharField(source="feed_type.name", read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True, allow_null=True)

    class Meta:
        model = FeedConsumption
        fields = "__all__"


class DietSerializer(serializers.ModelSerializer):
    feed_type_name = serializers.CharField(source="feed_type.name", read_only=True)
    pig_category_display = serializers.CharField(source="get_pig_category_display", read_only=True)
    sow_status_display = serializers.CharField(source="get_sow_status_display", read_only=True, allow_null=True)

    class Meta:
        model = Diet
        fields = "__all__"
