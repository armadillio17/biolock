from rest_framework import serializers
from user.models.roles import Role  # ✅ Replace 'your_app' with the actual app name

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'role_name', 'created_at', 'updated_at', 'deleted_at']

    def validate_role_name(self, value):
        """Ensure role name is valid and unique."""
        if not value.strip():
            raise serializers.ValidationError("Role name cannot be empty.")
        if not value.isalpha():
            raise serializers.ValidationError("Role name must contain only letters.")
        if len(value) < 3:
            raise serializers.ValidationError("Role name must be at least 3 characters long.")
        if Role.objects.filter(role_name=value).exists():
            raise serializers.ValidationError("This role already exists.")
        return value