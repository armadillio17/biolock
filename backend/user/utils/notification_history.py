from django.contrib.auth import get_user_model
from user.models.notification_history import NotificationHistory

User = get_user_model()

def log_notification(user_id, notification_type, data):
    if not user_id:
        raise ValueError("User ID must be provided")

    NotificationHistory.objects.create(
        user_id_id=user_id,  # use _id to assign FK directly
        type=notification_type,
        data=data
    )