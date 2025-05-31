from rest_framework import serializers
from user.models.request_overtime import OvertimeRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class OvertimeRequestSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = OvertimeRequest
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'deleted_at')

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()