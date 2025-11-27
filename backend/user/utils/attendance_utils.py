from user.models import Attendance, OvertimeRequest
from django.utils.timezone import now


def get_open_attendance(user_id, today):
    """
    Returns the open attendance record (clocked in but not clocked out) for the user today.
    """
    return Attendance.objects.filter(
        user_id=user_id,
        clock_in__date=today,
        clock_out__isnull=True,
        deleted_at__isnull=True
    ).first()


def has_any_attendance_today(user_id, today):
    """
    Checks if the user has any attendance record for today.
    """
    return Attendance.objects.filter(
        user_id=user_id,
        clock_in__date=today,
        deleted_at__isnull=True
    ).exists()


def get_last_attendance(user_id, today):
    """
    Returns the most recent attendance record for the user on today's date.
    """
    return Attendance.objects.filter(
        user_id=user_id,
        clock_in__date=today,
        deleted_at__isnull=True
    ).order_by('-clock_in').first()


def user_has_approved_overtime(user_id, today):
    """
    Checks if the user has an approved and unused overtime request for today.
    """
    return OvertimeRequest.objects.filter(
        user_id=user_id,
        date=today,
        status='approved',
        used=False
    ).exists()

def user_has_used_overtime_today(user_id, today):
    """
    Returns True if the user has already used an overtime session today.
    """
    return Attendance.objects.filter(
        user_id=user_id,
        date=today,
        is_overtime_clock_in=True
    ).exists()