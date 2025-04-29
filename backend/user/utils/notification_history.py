from django.contrib.auth import get_user_model
from user.models.notification_history import NotificationHistory

User = get_user_model()

def log_notification(user_id, notification_type, data):
    """Helper function to log a notification"""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        raise ValueError(f"User with ID {user_id} does not exist")

    NotificationHistory.objects.create(
        user_id=user,  # Now passing the actual user instance
        type=notification_type,
        data=data
    )
