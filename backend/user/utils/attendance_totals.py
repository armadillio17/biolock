"""Rebuild an AttendanceSummary from the punches that actually count.

Payroll reads AttendanceSummary rather than raw Attendance rows, so this is the
single place where a held punch is kept out of paid hours: exclude it here and
it is excluded from every payslip downstream. Call this after anything that
changes a day's punches or their review status.
"""

from decimal import Decimal

from user.models.attendance import Attendance
from user.models.attendance_summary import AttendanceSummary

# A punch in these states is measured but not paid.
NOT_COUNTED = ("pending", "rejected")

FULL_DAY_HOURS = Decimal("8.00")


def recalculate_summary(user, date):
    """Recompute the day's totals for one user and return the summary row."""
    rows = Attendance.objects.filter(
        user=user, date=date, deleted_at__isnull=True
    ).order_by("id")

    counted = [row for row in rows if row.review_status not in NOT_COUNTED]

    working = sum((Decimal(str(row.working_hours or 0)) for row in counted), Decimal("0"))
    overtime = sum((Decimal(str(row.overtime_hours or 0)) for row in counted), Decimal("0"))
    leave = FULL_DAY_HOURS if any(row.status == "on_leave" for row in rows) else Decimal("0")
    absences = 1 if any(row.status == "absent" for row in rows) else 0

    summary, _ = AttendanceSummary.objects.update_or_create(
        user=user,
        date=date,
        defaults={
            # Point at the first punch of the day; the totals carry the rest.
            "attendance": rows.first(),
            "total_working_hours": working,
            "total_overtime_hours": overtime,
            "total_leave_hours": leave,
            "total_absences": absences,
        },
    )
    return summary
