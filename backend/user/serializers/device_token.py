from rest_framework import serializers
from user.models import DeviceToken

class DeviceTokenSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DeviceToken
        fields = ['id', 'user_id', 'token', 'device_type', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        token = validated_data.get('token')

        # Update or create - if token exists, update it; otherwise create new
        device_token, created = DeviceToken.objects.update_or_create(
            token=token,
            defaults={
                'user_id': user_id,
                'is_active': True,
                **validated_data
            }
        )
        return device_token
