from rest_framework import serializers
from user.models.logs import Logs

class LogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logs
        fields = '__all__'  # Include all fields
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']
