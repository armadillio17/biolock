from rest_framework import serializers
from user.models.holiday.custom_holiday import CustomHoliday

class CustomHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomHoliday
        fields = '__all__'