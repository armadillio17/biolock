from rest_framework import serializers
from user.models.report import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'  # Include all fields
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')  # Auto-managed fields