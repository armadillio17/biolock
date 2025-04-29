from rest_framework import serializers
from user.models.holiday import Holiday  # Import your Holiday model

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'  # Include all fields