#This allows you to import the serializer without specifying the file
from .attendance import AttendanceSerializer, UserAttendanceSerializer, ClockInSerializer, ClockOutSerializer
from .users import UserSerializer
from .department import DepartmentSerializer, AssignUserDepartmentSerializer
from .position import PositionSerializer, AssignUserPositionSerializer
from .leave_request import LeaveRequestSerializer
from .notification_history import NotificationHistorySerializer
from .report import ReportSerializer

__all__ = [
    "AttendanceSerializer",
    "UserAttendanceSerializer",
    "ClockInSerializer",
    "ClockOutSerializer",
    "UserSerializer",
    "DepartmentSerializer",
    "AssignUserDepartmentSerializer",
    "PositionSerializer",
    "AssignUserPositionSerializer",
    "LeaveRequestSerializer",
    "NotificationHistorySerializer",
    "ReportSerializer",
    ]