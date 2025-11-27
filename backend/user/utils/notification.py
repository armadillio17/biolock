from user.models.notification import Notifications
from django.contrib.auth import get_user_model

User = get_user_model()

def send_notification(user_id, notification_type, data):
    
    print("User", user_id)
    
    try:
        # Get the logged-in user
        user = User.objects.get(id=user_id)

        # Create a notification message
        message = f"{notification_type}: {data.get('details', '')}"

        # Notify all superusers (admins)
        admins = User.objects.filter(is_superuser=True)

        for admin in admins:
            Notifications.objects.create(
                user=admin,
                message=message
            )
    except Exception as e:
        print("Error creating notification:", str(e))