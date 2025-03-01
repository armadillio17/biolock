#This allows you to import the serializer without specifying the file
from .attendance import AttendanceSerializer, UserAttendanceSerializer, ClockInSerializer, ClockOutSerializer
from .users import UserSerializer

__all__ = [
    "AttendanceSerializer",
    "UserAttendanceSerializer",
    "ClockInSerializer",
    "ClockOutSerializer",
    "UserSerializer"
    ]