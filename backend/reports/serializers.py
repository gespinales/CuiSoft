from rest_framework import serializers


class DashboardStatsSerializer(serializers.Serializer):
    total_sows = serializers.IntegerField()
    active_sows = serializers.IntegerField()
    pregnant_sows = serializers.IntegerField()
    total_boars = serializers.IntegerField()
    total_piglets = serializers.IntegerField()
    piglets_last_30_days = serializers.IntegerField()
    weaned_last_30_days = serializers.IntegerField()
    mortality_last_30_days = serializers.IntegerField()
    active_growers = serializers.IntegerField()
    pending_vaccinations = serializers.IntegerField()
    feed_stock_value = serializers.DecimalField(max_digits=12, decimal_places=2)


class SowProductivitySerializer(serializers.Serializer):
    ear_tag = serializers.CharField()
    total_farrowings = serializers.IntegerField()
    total_piglets_alive = serializers.IntegerField()
    avg_piglets_per_farrowing = serializers.FloatField()
    total_weaned = serializers.IntegerField()
    last_farrowing_date = serializers.DateField(allow_null=True)
    last_weaning_date = serializers.DateField(allow_null=True)
