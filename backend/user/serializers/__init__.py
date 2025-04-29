#This allows you to import the serializer without specifying the file
from .attendance import AttendanceSerializer, UserAttendanceSerializer, ClockInSerializer, ClockOutSerializer
from .users import UserSerializer, UserProfileSerializer
from .department import DepartmentSerializer, AssignUserDepartmentSerializer
from .position import PositionSerializer, AssignUserPositionSerializer
from .leave_request import LeaveRequestSerializer
from .notification_history import NotificationHistorySerializer
from .report import ReportSerializer
from .holiday import HolidaySerializer
from .attendance_adjustments import AttendanceAdjustmentsSerializer
from .logs import LogsSerializer
from .attendance_summary import AttendanceSummarySerializer

__all__ = [
    "AttendanceSerializer",
    "UserAttendanceSerializer",
    "ClockInSerializer",
    "ClockOutSerializer",
    "UserSerializer",
    "UserProfileSerializer",
    "DepartmentSerializer",
    "AssignUserDepartmentSerializer",
    "PositionSerializer",
    "AssignUserPositionSerializer",
    "LeaveRequestSerializer",
    "NotificationHistorySerializer",
    "ReportSerializer",
    "HolidaySerializer",
    "AttendanceAdjustmentsSerializer",
    "LogsSerializer",
    "AttendanceSummarySerializer",
    ]