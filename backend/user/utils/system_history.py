from django.contrib.auth import get_user_model
from user.models.system_history import SystemHistory

User = get_user_model()

def log_notification(user_id, notification_type, data):
    if not user_id:
        # Skip logging for system operations or unauthenticated requests
        return

    SystemHistory.objects.create(
        user_id_id=user_id,
        type=notification_type,
        data=data
    )