from rest_framework import serializers
from django.utils.timezone import now
from user.models.attendance import Attendance
from datetime import datetime
from django.utils import timezone
import pytz
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from user.models.request_overtime import OvertimeRequest  # Adjust based on your app structure
from .users import CustomUserProfileSerializer

User = get_user_model()

class AttendanceSerializer(serializers.ModelSerializer):
    user = CustomUserProfileSerializer(read_only=True) 
    class Meta:
        model = Attendance
        fields = '__all__'
        
class UserAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = 'user_id'

class ClockInSerializer(serializers.ModelSerializer):
    
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    
    class Meta:
        model = Attendance
        fields = '__all__'
        extra_kwargs = {
            'date': {'required': False},
            'status': {'required': False},
            'scheduled_start': {'required': False},
            'scheduled_end': {'required': False}
        }

    def create(self, validated_data):
        today = now().date()
        user = validated_data['user']

        # Check if the user already has a clock-in record for today
        existing_attendance = Attendance.objects.filter(
            user=user,
            clock_in__date=today
        ).first()

        # Check for approved overtime
        has_approved_overtime = OvertimeRequest.objects.filter(
            user=user,
            date=today,
            status='approved'
        ).exists()

        # If already clocked in and no approved overtime → prevent duplicate
        if existing_attendance and not has_approved_overtime:
            raise serializers.ValidationError({
                "error": "You’ve already clocked in today and don’t have an approved overtime request.",
                "has_clocked_in": True,
                "is_clockOut": existing_attendance.is_clockOut
            })

        # If clocked out but has approved overtime → allow new clock-in
        if existing_attendance and existing_attendance.is_clockOut and has_approved_overtime:
            validated_data['date'] = today
            validated_data['status'] = 'working'
            validated_data['clock_in'] = now()
            validated_data['clock_out'] = None  # Reset clock-out if needed
            validated_data['is_clockOut'] = False

            return Attendance.objects.create(**validated_data)

        # If no attendance or still working → proceed normally
        validated_data['date'] = today
        validated_data['status'] = 'working'
        validated_data['clock_in'] = now()

        return Attendance.objects.create(**validated_data)
        
class ClockOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        extra_kwargs = {
            'date': {'required': False},
            'status': {'required': False},
            'scheduled_start': {'required': False},
            'scheduled_end': {'required': False}
        }
        
    def update(self, instance, validated_data):
        try:
            today = now().date()
            user = instance.user_id  # Get user from instance (attendance record)
            
            tz = pytz.timezone('Asia/Manila')

            # Ensure we're updating the correct record (already filtered in view)
            # instance.clock_out = now()  # Set the clock-out time
            # instance.clock_out = now().astimezone(tz)
            instance.clock_out = now()
            
            clock_in_time = instance.clock_in.astimezone(tz)
            clock_out_time = instance.clock_out.astimezone(tz)
            
            print(f"today {today}")
            print(f"clock_in_time {clock_in_time}")
            print(f"clock_out_time {clock_out_time}")
            
            time_difference = clock_out_time - clock_in_time
            total_hours = time_difference.total_seconds() // 3600
            instance.working_hours = min(total_hours, 8)
            instance.overtime_hours = max(total_hours - 8, 0)
            instance.is_clockOut = True
            
            instance.save()
            
            return instance

        except Exception as e:
            print(f"Error updating attendance record: {e}")
            raise serializers.ValidationError(f"Update failed: {str(e)}")