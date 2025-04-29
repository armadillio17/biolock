from rest_framework import serializers
from user.models.attendance_adjustments import AttendanceAdjustments

class AttendanceAdjustmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceAdjustments
        fields = '__all__'  # Include all fields
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']
