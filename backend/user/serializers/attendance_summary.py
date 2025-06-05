from rest_framework import serializers
from user.models import AttendanceSummary, Holiday, HolidayConfig

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['holiday_name', 'holiday_date']


class HolidayConfigSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = HolidayConfig
        fields = ['type', 'pay_percentage', 'is_active']

    def get_type(self, obj):
        return obj.get_type_display()


class AttendanceSummarySerializer(serializers.ModelSerializer):
    holiday = serializers.SerializerMethodField()
    holiday_config = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'user', 'attendance', 'date',
            'total_working_hours', 'total_overtime_hours',
            'total_leave_hours', 'total_absences',
            'related_holiday', 'holiday_configuration',
            'created_at', 'updated_at', 'deleted_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']

    def get_holiday(self, obj):
        if obj.attendance and obj.attendance.holiday:
            return HolidaySerializer(obj.attendance.holiday).data
        return None

    def get_holiday_config(self, obj):
        if obj.attendance and obj.attendance.holiday and hasattr(obj.attendance.holiday, 'config'):
            return HolidayConfigSerializer(obj.attendance.holiday.config).data
        return None