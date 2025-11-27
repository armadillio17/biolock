import os
from django.core.management.base import BaseCommand
from django.conf import settings

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request


class Command(BaseCommand):
    help = 'Authorize Gmail API access and generate token.json'

    SCOPES = ['https://www.googleapis.com/auth/gmail.send']

    def handle(self, *args, **options):
        credentials_path = getattr(
            settings,
            'GMAIL_CREDENTIALS_PATH',
            os.path.join(settings.BASE_DIR, 'google_credentials', 'credentials_for_smtp.json')
        )
        token_path = getattr(
            settings,
            'GMAIL_TOKEN_PATH',
            os.path.join(settings.BASE_DIR, 'google_credentials', 'token.json')
        )

        if not os.path.exists(credentials_path):
            self.stderr.write(
                self.style.ERROR(f'Credentials file not found: {credentials_path}')
            )
            return

        creds = None

        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, self.SCOPES)
            self.stdout.write('Found existing token.json')

        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                self.stdout.write('Refreshing expired token...')
                creds.refresh(Request())
            else:
                self.stdout.write('Starting OAuth authorization flow...')
                self.stdout.write(self.style.WARNING(
                    'A browser window will open. Log in with the Gmail account '
                    'you want to send emails from.'
                ))

                flow = InstalledAppFlow.from_client_secrets_file(
                    credentials_path, self.SCOPES
                )
                creds = flow.run_local_server(port=0)

            with open(token_path, 'w') as token:
                token.write(creds.to_json())

            self.stdout.write(self.style.SUCCESS(f'Token saved to: {token_path}'))
        else:
            self.stdout.write(self.style.SUCCESS('Token is valid!'))

        self.stdout.write(self.style.SUCCESS(
            '\nGmail API is ready! Your app can now send emails.'
        ))
