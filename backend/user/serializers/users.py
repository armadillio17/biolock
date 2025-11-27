from rest_framework import serializers
from user.models.users import CustomUser
# from django.contrib.auth.models import User
from .position import CustomUserPosition

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = '__all__'
        
class UserProfileSerializer(serializers.ModelSerializer):
    position = CustomUserPosition(read_only=True) 
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'role_id',
            'department_id',
            'position',
            'first_name', 
            'last_name',
            'phone_number',
            'email',
            'created_at',
            'profile_picture', 
            ]
        
    def get_profile_picture(self, obj):
        if obj.profile_picture:
            return obj.profile_picture.url
        return None  # or return ""
    
class CustomUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name']