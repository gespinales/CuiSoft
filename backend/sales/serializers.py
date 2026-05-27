from rest_framework import serializers
from .models import Customer, Sale, SaleItem, GrowOutBatch, GrowOutPig


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = "__all__"


class SaleSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = "__all__"


class GrowOutPigSerializer(serializers.ModelSerializer):
    pig_name = serializers.CharField(source="pig.ear_tag", read_only=True)

    class Meta:
        model = GrowOutPig
        fields = "__all__"


class GrowOutBatchSerializer(serializers.ModelSerializer):
    pigs = GrowOutPigSerializer(many=True, read_only=True)

    class Meta:
        model = GrowOutBatch
        fields = "__all__"
