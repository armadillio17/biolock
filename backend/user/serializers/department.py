from rest_framework import serializers
from django.contrib.auth import get_user_model
from user.models.department import Department, DepartmentUser

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DepartmentSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'department_name', 'created_at', 'updated_at', 'deleted_at', 'users']

    def get_users(self, obj):
        users = User.objects.filter(departmentuser__department=obj)
        return UserSerializer(users, many=True).data

class AssignUserDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentUser
        fields = ['id', 'department', 'user', 'assigned_at']
