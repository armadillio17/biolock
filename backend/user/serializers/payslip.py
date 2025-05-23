from rest_framework import serializers
from user.models import Payslip
from user.models.payroll_period import PayrollPeriod
from user.models.users import CustomUser



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = 'first_name', 'last_name'

class PayrollPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollPeriod
        fields = 'id', 'start_date', 'end_date', 'total_amount', 'is_processed'

class PayslipSerializer(serializers.ModelSerializer):
    employee_contributions = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    employer_contributions = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    payroll_period = PayrollPeriodSerializer(read_only=True)
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ['generated_at']