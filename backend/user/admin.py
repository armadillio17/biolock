from django.contrib import admin

# Register your models here.
from .models import CustomUser, Role, Attendance

# Register Role with customization
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'role_name', 'created_at', 'updated_at', 'deleted_at')  # Show these columns
    list_filter = ('role_name',)
    search_fields = ('role_name',)

# Register Attendance as a simple model
# remove user_id when User model is available and change to user
# remove holiday_id when Holiday model is available and change to holiday
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'holiday_id', 'date', 'clock_in', 'clock_out', 'status', 'working_hours',
                    'overtime_hours', 'scheduled_start', 'scheduled_end', 'created_at', 'updated_at', 'deleted_at')
    list_filter = ('status', 'date')
    search_fields = ('user__username',)    