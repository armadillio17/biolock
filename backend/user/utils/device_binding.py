"""One device, one person -- and keep punches on the app where possible.

Three rules, applied to every clock-in and clock-out:

1. A handset belongs to exactly one employee. A punch carrying an ``android_id``
   that is bound to someone else is refused outright -- that is the whole point
   of the rule, since a shared phone is how buddy-punching happens.
2. An employee has one active handset. A punch from a *different* phone is
   refused with ``device_mismatch``; releasing the old one is an admin action,
   so a lost or swapped phone leaves a trail instead of silently rebinding.
3. A browser punch from someone who owns a registered phone is refused with
   ``use_mobile_app`` -- otherwise the browser is a trivial bypass of rules 1
   and 2. A browser punch from someone with no phone registered is ALLOWED
   (they may not have the app yet) but raises an admin notification, so the
   gap gets closed rather than ignored.
"""

from django.utils.timezone import localdate
from rest_framework import status
from rest_framework.response import Response

from user.models import CustomUser, Notifications, SystemHistory, UserDevice


def _describe(device):
    return {
        "id": device.id,
        "device_name": device.device_name,
        "device_model": device.device_model,
        "platform": device.platform,
        "registered_at": device.created_at,
        "last_seen_at": device.last_seen_at,
    }


def _notify_admins(message, actor, history_type, details):
    """Fan a message out to every admin, and record it in system history."""
    admins = CustomUser.objects.filter(
        role__role_name__in=["admin", "superadmin"], deleted_at__isnull=True
    )
    Notifications.objects.bulk_create(
        [Notifications(user=admin, message=message, is_read=False) for admin in admins]
    )
    if actor is not None:
        SystemHistory.objects.create(
            user_id=actor,
            type=history_type,
            data={"status": "Attention", "details": details},
        )


def active_device(user):
    return UserDevice.objects.filter(user=user, is_active=True).first()


def resolve_punch_source(user, data):
    """Decide whether a punch is allowed, and from what.

    Returns ``(source, device, error_response)``. ``source`` is "mobile" or
    "browser"; ``device`` is the bound UserDevice when the punch came from the
    app. A non-None ``error_response`` should be returned to the caller as-is.
    """
    android_id = (data.get("android_id") or "").strip()
    registered = active_device(user)

    # ---------------------------------------------------------- mobile app
    if android_id:
        claimed_by = (
            UserDevice.objects.filter(android_id=android_id, is_active=True)
            .select_related("user")
            .first()
        )

        if claimed_by and claimed_by.user_id != user.id:
            owner = claimed_by.user
            _notify_admins(
                f"{user.first_name} {user.last_name} tried to clock in on a phone "
                f"registered to {owner.first_name} {owner.last_name}.",
                user,
                "Device Conflict",
                f"android_id already bound to user #{owner.id}",
            )
            return None, None, Response(
                {
                    "error": "This phone is already registered to another employee. "
                             "Ask your administrator to sort out the device assignment.",
                    "device_conflict": True,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registered and registered.android_id != android_id:
            return None, None, Response(
                {
                    "error": "This is not the phone registered to you. Ask your "
                             "administrator to release your old device first.",
                    "device_mismatch": True,
                    "registered_device": _describe(registered),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if registered is None:
            # First punch from this handset: bind it now so onboarding is one
            # step, and tell the admins a new phone was claimed.
            registered = UserDevice.objects.create(
                user=user,
                android_id=android_id,
                platform=(data.get("platform") or "android").lower(),
                device_name=data.get("device_name"),
                device_model=data.get("device_model"),
                app_version=data.get("app_version"),
            )
            _notify_admins(
                f"{user.first_name} {user.last_name} registered a new device "
                f"({registered.device_model or registered.device_name or 'unknown model'}).",
                user,
                "Device Registered",
                f"device #{registered.id} bound to user #{user.id}",
            )

        registered.touch()
        return "mobile", registered, None

    # ------------------------------------------------------------- browser
    if registered:
        return None, None, Response(
            {
                "error": "Please clock in from the Biolock app on your registered phone.",
                "use_mobile_app": True,
                "registered_device": _describe(registered),
            },
            status=status.HTTP_409_CONFLICT,
        )

    # No app on file. Let the punch through -- they still need to be paid -- but
    # make sure an admin sees that this person is not on the app yet. Once a day
    # is plenty: a punch in and out every day would otherwise bury the admins.
    already_flagged_today = SystemHistory.objects.filter(
        user_id=user, type="Browser Punch", created_at__date=localdate()
    ).exists()
    if not already_flagged_today:
        _notify_admins(
            f"{user.first_name} {user.last_name} clocked in from a browser and has no "
            f"registered device. Help them install the Biolock app.",
            user,
            "Browser Punch",
            "no registered device",
        )
    return "browser", None, None


def resolve_clockout_source(user, data):
    """Same rules as :func:`resolve_punch_source`, but never refuses.

    A clock-out cannot be blocked on the handset. The shift is already open and
    was device-verified at clock-in, so refusing here prevents nothing -- the
    punch it would guard against already happened -- while leaving the employee
    permanently clocked in, which corrupts the record and needs an admin to
    unpick. So the punch is recorded and held for review instead, the same
    bargain the browser path already makes: they still need to be paid, but an
    admin gets to see it.

    Returns ``(source, device, held_for_review)``.
    """
    source, device, error = resolve_punch_source(user, data)
    if error is None:
        return source, device, False

    reason = (error.data or {}).get("error", "device not recognised")
    _notify_admins(
        f"{user.first_name} {user.last_name} clocked out from a device that is not "
        f"theirs. The punch was recorded and is held for your review.",
        user,
        "Clock-out Device Override",
        reason,
    )
    android_id = (data.get("android_id") or "").strip()
    return ("mobile" if android_id else "browser"), None, True
