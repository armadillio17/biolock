from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings

def get_philippine_holidays():
    # Path to your service account credentials JSON file
    CREDENTIALS_PATH = settings.GOOGLE_CALENDAR_CREDENTIALS_JSON_PATH

    # Scopes required (read-only access to calendar)
    SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'] 

    # Authenticate using service account
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )

    # Build the Calendar API service
    service = build('calendar', 'v3', credentials=credentials)

    # Fetch events from the Philippine holiday calendar
    calendar_id = settings.PHILIPPINE_HOLIDAY_CALENDAR_ID
    events_result = service.events().list(calendarId=calendar_id, singleEvents=True).execute()
    events = events_result.get('items', [])

    holidays = []
    for event in events:
        date_key = 'date' if 'date' in event['start'] else 'dateTime'
        holiday_date = datetime.fromisoformat(event['start'][date_key]).date()
        holidays.append({
            'name': event['summary'],
            'date': holiday_date
        })

    return holidays