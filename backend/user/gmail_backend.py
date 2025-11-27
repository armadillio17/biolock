import base64
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build


class GmailBackend(BaseEmailBackend):
    """
    Django email backend that uses Gmail API instead of SMTP.
    Requires OAuth2 credentials and a valid token.json file.
    """

    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.credentials_path = getattr(
            settings,
            'GMAIL_CREDENTIALS_PATH',
            os.path.join(settings.BASE_DIR, 'google_credentials', 'credentials_for_smtp.json')
        )
        self.token_path = getattr(
            settings,
            'GMAIL_TOKEN_PATH',
            os.path.join(settings.BASE_DIR, 'google_credentials', 'token.json')
        )
        self.scopes = ['https://www.googleapis.com/auth/gmail.send']
        self.service = None

    def _get_service(self):
        """Get or create Gmail API service."""
        if self.service:
            return self.service

        creds = None

        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.scopes)

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(self.token_path, 'w') as token:
                    token.write(creds.to_json())
            else:
                raise Exception(
                    f"Gmail token not found or invalid. "
                    f"Run 'python manage.py gmail_auth' to authorize."
                )

        self.service = build('gmail', 'v1', credentials=creds)
        return self.service

    def _create_message(self, email_message):
        """Convert Django EmailMessage to Gmail API format."""
        if email_message.content_subtype == 'html' or any(
            alt[1] == 'text/html' for alt in getattr(email_message, 'alternatives', [])
        ):
            msg = MIMEMultipart('alternative')
            msg.attach(MIMEText(email_message.body, 'plain'))

            for content, mimetype in getattr(email_message, 'alternatives', []):
                if mimetype == 'text/html':
                    msg.attach(MIMEText(content, 'html'))
        else:
            msg = MIMEText(email_message.body, 'plain')

        msg['to'] = ', '.join(email_message.to)
        msg['from'] = email_message.from_email
        msg['subject'] = email_message.subject

        if email_message.cc:
            msg['cc'] = ', '.join(email_message.cc)
        if email_message.bcc:
            msg['bcc'] = ', '.join(email_message.bcc)
        if email_message.reply_to:
            msg['reply-to'] = ', '.join(email_message.reply_to)

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        return {'raw': raw}

    def send_messages(self, email_messages):
        """Send one or more EmailMessage objects and return the number sent."""
        if not email_messages:
            return 0

        num_sent = 0
        try:
            service = self._get_service()

            for message in email_messages:
                try:
                    gmail_message = self._create_message(message)
                    service.users().messages().send(
                        userId='me',
                        body=gmail_message
                    ).execute()
                    num_sent += 1
                except Exception as e:
                    if not self.fail_silently:
                        raise
        except Exception as e:
            if not self.fail_silently:
                raise

        return num_sent
