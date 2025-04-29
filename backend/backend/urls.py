"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from user.views import (
    UserCreateView, UserUpdateDeleteView, UserAuthenticationView,
    AttendanceListCreateView, AttendanceDetailUpdateDeleteView, UserAttendanceView, UserClockInView, UserClockOutView, GetUserRoleView, LogoutView, UserCountView, DailyAttendanceCountView,
    NewRegistrationRegisteredList, AcceptedUserList,
) 
from user.views.leave_request import LeaveRequestListCreateView, LeaveRequestDetailView, LeaveRequestCountView
from user.views.department import (
    DepartmentListCreateView, DepartmentDetailView, 
    AssignUserToDepartmentView, RemoveUserFromDepartmentView
)
from user.views.position import (
    PositionListCreateView, PositionDetailView, 
    AssignUserToPositionView, RemoveUserFromPositionView
)
from user.views.notification_history import (
    NotificationHistoryListCreateView, NotificationHistoryDetailView
)
from user.views.report.report import (
    ReportListCreateView, ReportDetailView, GenerateDailyReport
)
from user.views.report.download_report import (
    DownloadAttendancePDF
)
from user.views.holiday import (
    HolidayListCreateView, HolidayDetailView
)
from user.views.attendance_adjustments import (
    AttendanceAdjustmentsListCreateView, AttendanceAdjustmentsDetailView
)
from user.views.logs import (
    LogsListCreateView, LogsDetailView
)
from user.views.attendance_summary import (
    AttendanceSummaryListCreateView, AttendanceSummaryDetailView
)

urlpatterns = [
    
    path('admin/', admin.site.urls),
    
    # Auth
    path('login/', UserAuthenticationView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Users
    path('user/', UserCreateView.as_view(), name='user-create'),
    path('users/<int:pk>/', UserUpdateDeleteView.as_view(), name='user-update-delete'),
    path('users/new-registered/', NewRegistrationRegisteredList.as_view(), name='user-count'), # List of Newly Registered Account
    path('users/list/', AcceptedUserList.as_view(), name='user-count'), # List of All Approved Account
    path('users/user-count/', UserCountView.as_view(), name='user-count'), # User Count
    path('<int:user_id>/role/', GetUserRoleView.as_view(), name='get-user-role'),
    
    # Attendance
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list'),
    path('attendance/<int:pk>/', AttendanceDetailUpdateDeleteView.as_view(), name='attendance-detail'),
    path('attendance/absent-count/', DailyAttendanceCountView.as_view(), name='attendance-detail'),
    path('user-attendance/<int:user_id>', UserAttendanceView.as_view(), name='user-attendance-detail'),
    
    # User Clock In
    path('clock-in/', UserClockInView.as_view(), name='user-clock-in'),
    path('clock-out/', UserClockOutView.as_view(), name='user-clock-out'),

    # Leave Request Endpoints
    path('leave-requests/', LeaveRequestListCreateView.as_view(), name='leave-request-list'),
    path('leave-requests/<int:pk>/<str:date>', LeaveRequestDetailView.as_view(), name='leave-request-detail'),
    path('leave-requests/count/', LeaveRequestCountView.as_view(), name='leave-request-detail'),

    # Department Endpoints
    path('departments/', DepartmentListCreateView.as_view(), name='department-list'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    path('departments/<int:department_id>/assign-user/', AssignUserToDepartmentView.as_view(), name='assign-user-to-department'),
    path('departments/<int:department_id>/remove-user/', RemoveUserFromDepartmentView.as_view(), name='remove-user-from-department'),

    # Position Endpoints
    path('positions/', PositionListCreateView.as_view(), name='position-list'),
    path('positions/<int:pk>/', PositionDetailView.as_view(), name='position-detail'),
    
    # Assign/Remove Users to/from Positions
    path('departments/<int:department_id>/positions/<int:position_id>/assign-user/', AssignUserToPositionView.as_view(), name='assign-user-to-position'),
    path('departments/<int:department_id>/positions/<int:position_id>/remove-user/', RemoveUserFromPositionView.as_view(), name='remove-user-from-position'),

    # Notification History Endpoints
    path('notifications/', NotificationHistoryListCreateView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationHistoryDetailView.as_view(), name='notification-detail'),

    # Report Endpoints
    path('reports/', ReportListCreateView.as_view(), name='report-list'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/daily-report/', GenerateDailyReport.as_view(), name='report-detail'),
    path('reports/download-pdf/<int:report_id>/', DownloadAttendancePDF.as_view(), name='download-report'),

    # Holiday Endpoints
    path('holidays/', HolidayListCreateView.as_view(), name='holiday-list-create'),
    path('holidays/<int:pk>/', HolidayDetailView.as_view(), name='holiday-detail'),

    # Attendance Adjustments Endpoints
    path('attendance-adjustments/', AttendanceAdjustmentsListCreateView.as_view(), name='attendance-adjustments-list-create'),
    path('attendance-adjustments/<int:pk>/', AttendanceAdjustmentsDetailView.as_view(), name='attendance-adjustments-detail'),

    # Logs Endpoint
    path('logs/', LogsListCreateView.as_view(), name='logs-list-create'),
    path('logs/<int:pk>/', LogsDetailView.as_view(), name='logs-detail'),

    # Attendance Summary Endpoints
    path('attendance-summary/', AttendanceSummaryListCreateView.as_view(), name='attendance-summary-list-create'),
    path('attendance-summary/<int:pk>/', AttendanceSummaryDetailView.as_view(), name='attendance-summary-detail'),
]
