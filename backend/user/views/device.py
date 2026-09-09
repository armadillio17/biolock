"""Device registration/revocation, and the reminders feed."""

from datetime import timedelta

from django.db import IntegrityError
from django.db.models import Q
from django.utils.timezone import localdate, now
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from user.models import (
    Attendance,
    CustomUser,
    LeaveRequest,
    Notifications,
    OvertimeRequest,
    PayrollPeriod,
    UserDevice,
)
from user.utils.device_binding import active_device
from user.utils.attendance_totals import recalculate_summary


class UserDeviceSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = UserDevice
        fields = [
            "id", "user", "user_name", "android_id", "platform", "device_name",
            "device_model", "app_version", "is_active", "last_seen_at",
            "revoked_at", "revoke_reason", "created_at",
        ]
        read_only_fields = ["is_active", "last_seen_at", "revoked_at", "revoke_reason"]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class DeviceRegisterView(APIView):
    """POST from the app on first launch, so binding does not wait for a punch."""

    def post(self, request):
        user_id = request.data.get("user_id")
        android_id = (request.data.get("android_id") or "").strip()

        if not user_id or not android_id:
            return Response(
                {"error": "user_id and android_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = CustomUser.objects.filter(id=user_id, deleted_at__isnull=True).first()
        if not user:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        claimed_by = (
            UserDevice.objects.filter(android_id=android_id, is_active=True)
            .select_related("user")
            .first()
        )
        if claimed_by and claimed_by.user_id != user.id:
            return Response(
                {
                    "error": "This phone is already registered to another employee.",
                    "device_conflict": True,
                },
                status=status.HTTP_409_CONFLICT,
            )
        if claimed_by:
            # Same user, same handset: refresh the metadata and move on.
            for field in ("device_name", "device_model", "app_version"):
                if request.data.get(field):
                    setattr(claimed_by, field, request.data[field])
            claimed_by.last_seen_at = now()
            claimed_by.save()
            return Response(UserDeviceSerializer(claimed_by).data, status=status.HTTP_200_OK)

        existing = active_device(user)
        if existing:
            return Response(
                {
                    "error": "You already have a registered phone. Ask an administrator "
                             "to release it before registering a new one.",
                    "device_mismatch": True,
                    "registered_device": UserDeviceSerializer(existing).data,
                },
                status=status.HTTP_409_CONFLICT,
            )

        try:
            device = UserDevice.objects.create(
                user=user,
                android_id=android_id,
                platform=(request.data.get("platform") or "android").lower(),
                device_name=request.data.get("device_name"),
                device_model=request.data.get("device_model"),
                app_version=request.data.get("app_version"),
                last_seen_at=now(),
            )
        except IntegrityError:
            # Two registrations raced for the same handset or user. Report the
            # conflict rather than letting it surface as a 500.
            return Response(
                {"error": "That device is already registered. Try again.",
                 "device_conflict": True},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(UserDeviceSerializer(device).data, status=status.HTTP_201_CREATED)


class DeviceListView(APIView):
    """Admin roster of bound phones. ?user_id= to scope, ?include_revoked=true for history."""

    def get(self, request):
        devices = UserDevice.objects.select_related("user")
        user_id = request.query_params.get("user_id")
        if user_id:
            devices = devices.filter(user_id=user_id)
        if request.query_params.get("include_revoked", "").lower() not in ("true", "1", "yes"):
            devices = devices.filter(is_active=True)
        return Response(UserDeviceSerializer(devices, many=True).data)


class DeviceRevokeView(APIView):
    """Release a handset so the employee can bind a new one."""

    def post(self, request, pk):
        device = UserDevice.objects.filter(pk=pk, is_active=True).first()
        if not device:
            return Response({"error": "Active device not found."},
                            status=status.HTTP_404_NOT_FOUND)

        revoked_by = CustomUser.objects.filter(id=request.data.get("revoked_by")).first()
        device.revoke(by=revoked_by, reason=request.data.get("reason"))

        Notifications.objects.create(
            user=device.user,
            message="Your registered device was released. Open the Biolock app on your "
                    "phone to register it again.",
        )
        return Response(UserDeviceSerializer(device).data, status=status.HTTP_200_OK)


class RemindersView(APIView):
    """Things that need somebody's attention, computed fresh on every call.

    Derived rather than stored, so an item disappears the moment it is dealt
    with -- a stored to-do list would need a second mechanism to clear itself.
    Admins get the org-wide queue, everyone else gets their own.
    """

    def get(self, request):
        user_id = request.query_params.get("user_id")
        user = CustomUser.objects.filter(id=user_id).select_related("role").first()
        if not user:
            return Response({"error": "user_id is required."},
                            status=status.HTTP_400_BAD_REQUEST)

        is_admin = bool(user.role and user.role.role_name in ("admin", "superadmin"))
        reminders = self._admin_reminders() if is_admin else self._staff_reminders(user)

        rank = {"critical": 0, "warning": 1, "info": 2}
        reminders.sort(key=lambda r: (rank[r["severity"]], -r["count"]))
        return Response({
            "is_admin": is_admin,
            "total": sum(r["count"] for r in reminders),
            "reminders": reminders,
        })

    @staticmethod
    def _item(key, severity, title, detail, count, action_url=None):
        return {
            "key": key, "severity": severity, "title": title,
            "detail": detail, "count": count, "action_url": action_url,
        }

    def _admin_reminders(self):
        today = localdate()
        items = []

        pending_leave = LeaveRequest.objects.filter(
            status="pending", deleted_at__isnull=True).count()
        if pending_leave:
            items.append(self._item(
                "leave_pending", "warning", "Leave requests awaiting approval",
                f"{pending_leave} request(s) have not been actioned.",
                pending_leave, "/leave-request"))

        pending_ot = OvertimeRequest.objects.filter(status="pending").count()
        if pending_ot:
            items.append(self._item(
                "overtime_pending", "warning", "Overtime requests awaiting approval",
                f"{pending_ot} request(s) need a decision.", pending_ot, "/overtime"))

        unapproved = CustomUser.objects.filter(
            is_accepted=False, deleted_at__isnull=True).count()
        if unapproved:
            items.append(self._item(
                "users_unapproved", "warning", "New registrations to review",
                f"{unapproved} account(s) cannot log in until approved.",
                unapproved, "/users"))

        # Staff with no phone bound: the gap the device rule exists to close.
        without_device = CustomUser.objects.filter(
            is_accepted=True, deleted_at__isnull=True,
            role__role_name="user",
        ).exclude(devices__is_active=True).count()
        if without_device:
            items.append(self._item(
                "no_device", "warning", "Employees without a registered device",
                f"{without_device} employee(s) are still punching from a browser. "
                f"Help them install the app.", without_device, "/users"))

        held = Attendance.objects.filter(
            review_status="pending", deleted_at__isnull=True).count()
        if held:
            items.append(self._item(
                "punches_held", "critical", "Punches held for review",
                f"{held} browser punch(es) are recorded but unpaid until you "
                f"approve them.", held, "/reminders"))

        browser_punches = Attendance.objects.filter(
            punch_source="browser", date__gte=today - timedelta(days=7),
            deleted_at__isnull=True).count()
        if browser_punches:
            items.append(self._item(
                "browser_punches", "info", "Browser punches this week",
                f"{browser_punches} punch(es) came from a browser instead of the app.",
                browser_punches, "/timesheet"))

        # Someone left a session open on an earlier day: hours cannot be computed.
        stale_open = Attendance.objects.filter(
            clock_in__isnull=False, clock_out__isnull=True,
            date__lt=today, deleted_at__isnull=True).count()
        if stale_open:
            items.append(self._item(
                "open_punches", "critical", "Unclosed attendance records",
                f"{stale_open} session(s) from a previous day were never clocked out.",
                stale_open, "/timesheet"))

        overdue_payroll = PayrollPeriod.objects.filter(
            is_processed=False, end_date__lt=today, deleted_at__isnull=True).count()
        if overdue_payroll:
            items.append(self._item(
                "payroll_overdue", "critical", "Payroll period ready to process",
                f"{overdue_payroll} finished period(s) have not been processed.",
                overdue_payroll, "/payroll"))

        return items

    def _staff_reminders(self, user):
        today = localdate()
        items = []

        if not active_device(user):
            items.append(self._item(
                "register_device", "warning", "Register the Biolock app",
                "You have no phone registered. Install the app and sign in once to "
                "bind it, so you can clock in from your phone.", 1, None))

        open_session = Attendance.objects.filter(
            user=user, clock_in__isnull=False, clock_out__isnull=True,
            deleted_at__isnull=True).order_by("-clock_in").first()
        if open_session:
            stale = open_session.date < today
            items.append(self._item(
                "open_session", "critical" if stale else "info",
                "You are still clocked in",
                f"Your session from {open_session.date} was never closed."
                if stale else "Remember to clock out at the end of your shift.",
                1, "/timesheet"))

        held = Attendance.objects.filter(
            user=user, review_status="pending", deleted_at__isnull=True).count()
        if held:
            items.append(self._item(
                "my_punches_held", "warning", "Attendance awaiting approval",
                f"{held} of your punch(es) were made from a browser and do not "
                f"count toward your hours until an administrator approves them.",
                held, "/timesheet"))

        pending = LeaveRequest.objects.filter(
            user=user, status="pending", deleted_at__isnull=True).count()
        if pending:
            items.append(self._item(
                "my_leave_pending", "info", "Leave request awaiting approval",
                f"{pending} of your request(s) are still pending.",
                pending, "/leave-request"))

        week_start = today - timedelta(days=today.weekday())
        late = Attendance.objects.filter(
            user=user, status="late", date__gte=week_start,
            deleted_at__isnull=True).count()
        if late >= 2:
            items.append(self._item(
                "late_streak", "warning", "Late arrivals this week",
                f"You have clocked in late {late} time(s) since Monday.",
                late, "/timesheet"))

        unread = Notifications.objects.filter(
            user=user, is_read=False, deleted_at__isnull=True).count()
        if unread:
            items.append(self._item(
                "unread", "info", "Unread notifications",
                f"{unread} notification(s) you have not opened.", unread, None))

        return items


class AttendanceReviewView(APIView):
    """Approve or reject a punch that was held for review.

    Approving recomputes the day's summary, which is what payroll reads, so the
    hours only become payable at this moment. Rejecting leaves the row in place
    as a record of the attempt -- deleting it would erase the evidence.
    """

    def get(self, request):
        """List punches awaiting review, newest first."""
        rows = (
            Attendance.objects.filter(review_status="pending", deleted_at__isnull=True)
            .select_related("user")
            .order_by("-date", "-clock_in")
        )
        user_id = request.query_params.get("user_id")
        if user_id:
            rows = rows.filter(user_id=user_id)

        return Response([
            {
                "id": row.id,
                "user_id": row.user_id,
                "user_name": f"{row.user.first_name} {row.user.last_name}".strip()
                if row.user else None,
                "date": row.date,
                "clock_in": row.clock_in,
                "clock_out": row.clock_out,
                "working_hours": row.working_hours,
                "punch_source": row.punch_source,
                "is_clock_in_outside": row.is_clock_in_outside,
                "clock_in_outside_reason": row.clock_in_outside_reason,
                "status": row.status,
            }
            for row in rows[:200]
        ])

    def post(self, request, pk):
        action = (request.data.get("action") or "").lower()
        if action not in ("approve", "reject"):
            return Response({"error": "action must be 'approve' or 'reject'."},
                            status=status.HTTP_400_BAD_REQUEST)

        attendance = Attendance.objects.filter(
            pk=pk, review_status="pending", deleted_at__isnull=True).first()
        if not attendance:
            return Response({"error": "No pending punch with that id."},
                            status=status.HTTP_404_NOT_FOUND)

        reviewer = CustomUser.objects.filter(id=request.data.get("reviewed_by")).first()
        attendance.review_status = "approved" if action == "approve" else "rejected"
        attendance.reviewed_by = reviewer
        attendance.reviewed_at = now()
        attendance.review_note = request.data.get("note")
        attendance.save(update_fields=[
            "review_status", "reviewed_by", "reviewed_at", "review_note", "updated_at",
        ])

        summary = recalculate_summary(attendance.user, attendance.date)

        Notifications.objects.create(
            user=attendance.user,
            message=(
                f"Your {attendance.date} attendance was approved."
                if action == "approve"
                else f"Your {attendance.date} attendance was not approved."
                     + (f" Reason: {attendance.review_note}" if attendance.review_note else "")
            ),
        )

        return Response({
            "id": attendance.id,
            "review_status": attendance.review_status,
            "paid_working_hours": summary.total_working_hours,
        }, status=status.HTTP_200_OK)
