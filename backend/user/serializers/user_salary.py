from rest_framework import serializers
from user.models import UserSalary

class UserSalarySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSalary
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'deleted_at', 'is_deleted']