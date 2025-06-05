from rest_framework import serializers
from user.models.holiday_config import HolidayConfig

class HolidayConfigSerializer(serializers.ModelSerializer):
    holiday_name = serializers.CharField(source='holiday.holiday_name', read_only=True)
    holiday_date = serializers.DateField(source='holiday.holiday_date', read_only=True)

    class Meta:
        model = HolidayConfig
        fields = ['id', 'holiday', 'holiday_name', 'holiday_date', 'type', 'pay_percentage']