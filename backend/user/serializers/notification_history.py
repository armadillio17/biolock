from rest_framework import serializers
from user.models.notification_history import NotificationHistory  # Adjust the import path as needed

class NotificationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationHistory
        fields = '__all__'  # Include all fields
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')  # These fields are auto-managed