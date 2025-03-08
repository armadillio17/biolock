from rest_framework import serializers
from django.utils.timezone import now
from user.models.attendance import Attendance
from datetime import datetime
from django.utils import timezone
import pytz
from rest_framework.exceptions import ValidationError

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        
class UserAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = 'user_id'
    
# class ClockInSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Attendance
#         fields = '__all__'
#         extra_kwargs = {
#             'date': {'required': False},
#             'status': {'required': False},
#             'scheduled_start': {'required': False},
#             'scheduled_end': {'required': False}
#         }
        
#     # def create(instance, validated_data):
        
#     #     try:
#     #         # today = now().date()
#     #         # user = instance.user_id  # Get user from instance (attendance record)
            
#     #         tz = pytz.timezone('Asia/Manila')

#     #         # Ensure we're updating the correct record (already filtered in view)
#     #         # instance.clock_out = now()  # Set the clock-out time
#     #         instance.clock_in = now().astimezone(tz)
#     #         instance.save()
#     #         return instance

#     #     except Exception as e:
#     #         print(f"Error updating attendance record: {e}")
#     #         raise serializers.ValidationError(f"Update failed: {str(e)}")

class ClockInSerializer(serializers.ModelSerializer):
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
        user_id = validated_data.get("user_id")  
        
        # Check if the user has already clocked in today
        attendance = Attendance.objects.filter(
            user_id=user_id,
            clock_in__date=today,
            clock_out__isnull=True
        ).first()
        
        if attendance:
            raise ValidationError({"error": "Already clocked in for today"}, code=400)  # Use 400 Bad Request

        try:
            validated_data['date'] = today
            validated_data['status'] = 'working'
            validated_data['clock_in'] = now()
            return Attendance.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError({"error": f"Error creating attendance record: {str(e)}"})
        
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
            instance.clock_out = datetime(2025, 3, 1, 22, 30, 0, tzinfo=tz)
            
            clock_in_time = instance.clock_in.astimezone(tz)
            clock_out_time = instance.clock_out.astimezone(tz)
            
            print(f"clock_in_time {clock_in_time}")
            print(f"clock_out_time {clock_out_time}")
            
            time_difference = clock_out_time - clock_in_time
            total_hours = time_difference.total_seconds() // 3600
            instance.working_hours = min(total_hours, 8)
            instance.overtime_hours = max(total_hours - 8, 0)
            
            
            instance.save()
            
            return instance

        except Exception as e:
            print(f"Error updating attendance record: {e}")
            raise serializers.ValidationError(f"Update failed: {str(e)}")