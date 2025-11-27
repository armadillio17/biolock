from rest_framework import serializers
from user.models.registration_link import RegistrationLink

class RegistrationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationLink
        fields = '__all__'  # Include all fields
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')  # Auto-managed fields