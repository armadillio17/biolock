from rest_framework import serializers
from django.contrib.auth.models import User
from user.models.department import Department, DepartmentUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class DepartmentSerializer(serializers.ModelSerializer):
    users = UserSerializer(many=True, read_only=True, source='departmentuser_set')

    class Meta:
        model = Department
        fields = ['id', 'name', 'created_at', 'updated_at', 'deleted_at', 'users']


class AssignUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentUser
        fields = ['id', 'department', 'user', 'assigned_at']