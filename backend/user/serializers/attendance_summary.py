from rest_framework import serializers
from user.models.attendance_summary import AttendanceSummary

class AttendanceSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSummary
        fields = '__all__'  # Include all fields
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']