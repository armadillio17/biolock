import logging

from firebase_admin import auth, exceptions, messaging

logger = logging.getLogger(__name__)


def get_firebase_user(uid):
    return auth.get_user(uid)


def send_push_notification(token, title, body, data=None):
    """Send a single FCM message to one device token.

    Returns the FCM message id on success. Raises firebase_admin exceptions on
    failure so callers can decide whether a token should be pruned.
    """
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        # FCM data payloads must be string -> string.
        data={str(k): str(v) for k, v in (data or {}).items()},
        token=token,
    )
    return messaging.send(message)


def send_push_to_user(user, title, body, data=None):
    """Push a notification to every active device the user has registered.

    Tokens that FCM reports as unregistered/invalid are deactivated so we stop
    sending to them. Returns the number of devices successfully notified.
    """
    # Imported lazily to avoid import-time model access during app startup.
    from user.models import DeviceToken

    sent = 0
    for device in DeviceToken.objects.filter(user=user, is_active=True):
        try:
            send_push_notification(device.token, title, body, data)
            sent += 1
        except (messaging.UnregisteredError, exceptions.InvalidArgumentError) as exc:
            logger.warning("Deactivating invalid FCM token %s: %s", device.id, exc)
            device.is_active = False
            device.save(update_fields=["is_active", "updated_at"])
        except Exception as exc:  # transient/unknown error: keep token, just log.
            logger.error("Failed to send FCM push to token %s: %s", device.id, exc)
    return sent
