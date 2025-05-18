from rest_framework import serializers
from user.models.payroll_period import PayrollPeriod

class PayrollPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollPeriod
        fields = '__all__'  # Include all fields
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']
