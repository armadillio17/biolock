from rest_framework import serializers
from user.models.system_history import SystemHistory  # Adjust the import path as needed

class SystemHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemHistory
        fields = '__all__'  # Include all fields
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')  # These fields are auto-managed