from django.contrib.auth import get_user_model
from user.models.notification_history import NotificationHistory

User = get_user_model()

def log_notification(user_id, notification_type, data):
    if not user_id:
        # Skip logging for system operations or unauthenticated requests
        return

    NotificationHistory.objects.create(
        user_id_id=user_id,
        type=notification_type,
        data=data
    )