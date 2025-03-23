from rest_framework import serializers
from django.contrib.auth.models import User
from user.models.department import Department
from user.models.position import Position, PositionUser, DepartmentPosition


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'department_name', 'created_at', 'updated_at', 'deleted_at']

        
class PositionSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Position
        fields = ['id', 'position_name', 'created_at', 'updated_at', 'deleted_at', 'users', 'department']

    def get_users(self, obj):
        users = User.objects.filter(positionuser__position=obj)
        return UserSerializer(users, many=True).data

    def get_department(self, obj):
        departments = Department.objects.filter(departmentposition__position=obj)
        return DepartmentSerializer(departments, many=True).data


class AssignUserPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PositionUser
        fields = ['id', 'position', 'user', 'assigned_at']

        
class DepartmentPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentPosition
        fields = ['id', 'department', 'position', 'assigned_at']