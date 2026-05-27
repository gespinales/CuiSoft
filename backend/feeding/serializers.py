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
    pig_name = serializers.CharField(source="pig.ear_tag", read_only=True, allow_null=True)

    class Meta:
        model = FeedConsumption
        fields = "__all__"


class DietSerializer(serializers.ModelSerializer):
    feed_type_name = serializers.CharField(source="feed_type.name", read_only=True)

    class Meta:
        model = Diet
        fields = "__all__"
