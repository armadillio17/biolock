from rest_framework import serializers
from user.models.holiday.holiday_config import HolidayConfig


class HolidayConfigSerializer(serializers.ModelSerializer):
    # Read-only fields from related Holiday model
    holiday_name = serializers.CharField(source='holiday.holiday_name', read_only=True)
    holiday_date = serializers.DateField(source='holiday.holiday_date', read_only=True)

    # Read-only fields from related Custom Holiday model
    custom_holiday_name = serializers.CharField(source='custom_holiday.custom_holiday_name', read_only=True)
    custom_holiday_date = serializers.DateField(source='custom_holiday.custom_holiday_date', read_only=True)

    class Meta:
        model = HolidayConfig
        fields = [
            'id',
            'holiday',
            'custom_holiday',
            'type',
            'pay_percentage',
            'is_active',
            # Include the extra fields
            'holiday_name',
            'holiday_date',
            'custom_holiday_name',
            'custom_holiday_date',
        ]
        extra_kwargs = {
            'holiday': {'required': False},
            'custom_holiday': {'required': False}
        }

    def validate(self, data):
        holiday = data.get('holiday')
        custom_holiday = data.get('custom_holiday')

        if holiday and custom_holiday:
            raise serializers.ValidationError("Only one of 'holiday' or 'custom_holiday' can be provided.")
        if not holiday and not custom_holiday:
            raise serializers.ValidationError("Either 'holiday' or 'custom_holiday' must be provided.")
        return data