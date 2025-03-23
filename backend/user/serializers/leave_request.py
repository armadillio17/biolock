from rest_framework import serializers
from user.models.leave_request import LeaveRequest  # Adjust the import path as needed

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'  # Include all fields
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')  # These fields are auto-managed