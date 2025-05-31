from django.apps import AppConfig
import firebase_admin
from firebase_admin import credentials
import os


class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user'

    def ready(self):
        import user.signals
        
        if not firebase_admin._apps:
            cred = credentials.Certificate(
                os.path.join(os.path.dirname(__file__), './biolock-a6aa5-firebase-adminsdk-fbsvc-8a6e3b1d3f.json')
            )
            firebase_admin.initialize_app(cred)