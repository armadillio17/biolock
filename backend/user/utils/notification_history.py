from user.models.notification_history import NotificationHistory

def log_notification(user_id, notification_type, data):
    """Helper function to log a notification"""
    NotificationHistory.objects.create(
        user_id=user_id,
        type=notification_type,
        data=data
    )