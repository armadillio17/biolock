import firebase_admin
from firebase_admin import credentials
import os

if not firebase_admin._apps:
    cred = credentials.Certificate(
        os.path.join(os.path.dirname(__file__), './biolock-a6aa5-firebase-adminsdk-fbsvc-8a6e3b1d3f.json')
    )
    firebase_admin.initialize_app(cred)
