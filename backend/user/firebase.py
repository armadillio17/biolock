import firebase_admin
from firebase_admin import auth, messaging

def get_firebase_user(uid):
    return firebase_admin.auth.get_user(uid)

def send_push_notification(token, title, body):
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=token,
    )
    response = messaging.send(message)
    return response