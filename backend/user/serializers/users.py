from rest_framework import serializers
from user.models.users import CustomUser
# from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'role_id',
            'department_id',
            'position_id',
            'first_name', 
            'last_name',
            'phone_number',
            'email',
            'created_at',
            ]