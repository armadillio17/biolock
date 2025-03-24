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
    AttendanceListCreateView, AttendanceDetailUpdateDeleteView, UserAttendanceView, UserClockInView, UserClockOutView, GetUserRoleView, LogoutView
) 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user/', UserCreateView.as_view(), name='user-create'),
    path('users/<int:pk>/', UserUpdateDeleteView.as_view(), name='user-update-delete'),
    path('login/', UserAuthenticationView.as_view(), name='login'),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance-list'),
    path('attendance/<int:pk>/', AttendanceDetailUpdateDeleteView.as_view(), name='attendance-detail'),
    path('clock-in/', UserClockInView.as_view(), name='user-clock-in'),
    path('clock-out/', UserClockOutView.as_view(), name='user-clock-out'),
    path('user-attendance/', UserAttendanceView.as_view(), name='user-attendance-detail'),
    path('<int:user_id>/role/', GetUserRoleView.as_view(), name='get-user-role'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
