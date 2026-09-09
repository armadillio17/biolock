from django.utils import timezone
from datetime import timedelta
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


OPEN_SHIFT_MAX_AGE = timedelta(hours=24)


def find_open_shift(user_id):
    """The shift this employee still needs to close, if any.

    Deliberately not scoped to "today": a shift that runs past midnight is
    still the one being closed, and scoping by date also went wrong whenever
    the stored UTC date and the business day disagreed -- an 07:46 Manila
    clock-in lands on the previous UTC date, so the punch became impossible to
    close. Bounded to 24 hours so a shift someone forgot weeks ago is not
    silently closed now as an enormous day; that needs an admin.
    """
    cutoff = timezone.now() - OPEN_SHIFT_MAX_AGE
    return (
        Attendance.objects.filter(
            user_id=user_id,
            clock_in__isnull=False,
            clock_in__gte=cutoff,
            clock_out__isnull=True,
            deleted_at__isnull=True,
        )
        .order_by("-clock_in")
        .first()
    )


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