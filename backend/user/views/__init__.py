from .users import UserCreateView, UserUpdateDeleteView, UserAuthenticationView, GetUserRoleView, LogoutView
from .attendance import AttendanceListCreateView, AttendanceDetailUpdateDeleteView, UserAttendanceView, UserClockInView, UserClockOutView
from .department import DepartmentListCreateView, DepartmentDetailView, AssignUserToDepartmentView, RemoveUserFromDepartmentView
from .leave_request import LeaveRequestListCreateView, LeaveRequestDetailView
from .notification_history import NotificationHistoryListCreateView, NotificationHistoryDetailView
from .report import ReportListCreateView, ReportDetailView

__all__ = [
    "UserCreateView",
    "UserUpdateDeleteView",
    "UserAuthenticationView",
    "GetUserRoleView",
    "LogoutView",
    "AttendanceListCreateView", 
    "AttendanceDetailUpdateDeleteView",
    "UserAttendanceView",
    "UserClockInView",
    "UserClockOutView",
    "DepartmentListCreateView",
    "DepartmentDetailView",
    "AssignUserToDepartmentView",
    "RemoveUserFromDepartmentView",
    "LeaveRequestListCreateView",
    "LeaveRequestDetailView",
    "NotificationHistoryListCreateView",
    "NotificationHistoryDetailView",
    "ReportListCreateView",
    "ReportDetailView",
    ]