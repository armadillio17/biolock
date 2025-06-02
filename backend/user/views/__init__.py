from .users import UserCreateView, UserUpdateDeleteView, UserAuthenticationView, GetUserRoleView, LogoutView, UserCountView, NewRegistrationRegisteredList, AcceptedUserList, UploadProfilePictureView, RemoveProfilePictureView
from .attendance import AttendanceListCreateView, AttendanceDetailUpdateDeleteView, UserAttendanceView, UserClockInView, UserClockOutView, DailyAttendanceCountView
from .department import DepartmentListCreateView, DepartmentDetailView, AssignUserToDepartmentView, RemoveUserFromDepartmentView
from .leave_request import LeaveRequestListCreateView, LeaveRequestDetailView, LeaveRequestCountView
from .notification_history import NotificationHistoryListCreateView, NotificationHistoryDetailView
from .report.report import ReportListCreateView, ReportDetailView, GenerateDailyReport
from .holiday import HolidayListCreateView, HolidayDetailView
from .attendance_adjustments import AttendanceAdjustmentsListCreateView, AttendanceAdjustmentsDetailView
from .position import PositionListCreateView, PositionDetailView, AssignUserToPositionView, RemoveUserFromPositionView
from .logs import LogsListCreateView, LogsDetailView
from .attendance_summary import AttendanceSummaryListCreateView, AttendanceSummaryDetailView
from .payroll.payslip import PayslipView
from .company import CompanyListView,CompanyUpdateDeleteView
from .request_overtime import ApproveOvertimeView

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
    "HolidayListCreateView",
    "HolidayDetailView",
    "AttendanceAdjustmentsListCreateView",
    "AttendanceAdjustmentsDetailView",
    "PositionListCreateView",
    "PositionDetailView",
    "AssignUserToPositionView",
    "RemoveUserFromPositionView",
    "LogsListCreateView",
    "LogsDetailView",
    "AttendanceSummaryListCreateView",
    "AttendanceSummaryDetailView",
    "UserCountView",
    "LeaveRequestCountView",
    "DailyAttendanceCountView",
    "GenerateDailyReport",
    "NewRegistrationRegisteredList",
    "AcceptedUserList",
    "PayslipView",
    "CompanyListView",
    "CompanyUpdateDeleteView",
    "ApproveOvertimeView",
    "UploadProfilePictureView",
    "RemoveProfilePictureView"
    ]