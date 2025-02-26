#This allows you to import the serializer without specifying the file
from .attendance import AttendanceSerializer
from .users import UserSerializer

__all__ = [
    "AttendanceSerializer", 
    "UserSerializer"
    ]