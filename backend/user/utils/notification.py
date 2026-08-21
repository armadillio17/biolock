from user.models.notification import Notifications
from django.contrib.auth import get_user_model
from user.firebase import send_push_to_user

User = get_user_model()

def send_notification(user_id, notification_type, data):

    print("User", user_id)

    try:
        # Get the logged-in user (validates the id exists / surfaces bad input)
        user = User.objects.get(id=user_id)

        # Create a notification message
        details = data.get('details', '')
        message = f"{notification_type}: {details}"

        # Notify all superusers (admins): store in-app + push to their devices
        admins = User.objects.filter(is_superuser=True)

        for admin in admins:
            Notifications.objects.create(
                user=admin,
                message=message
            )
            send_push_to_user(
                admin,
                title=notification_type,
                body=details or message,
                data={"type": notification_type},
            )
    except Exception as e:
        print("Error creating notification:", str(e))
