from django.core.management.base import BaseCommand
from user.utils.google_holiday import get_philippine_holidays
from user.models.holiday.holiday import Holiday

class Command(BaseCommand):
    help = 'Sync Philippine holidays from Google Calendar into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching Philippine holidays...")

        try:
            holidays = get_philippine_holidays()
            for item in holidays:
                Holiday.objects.update_or_create(
                    holiday_date=item['date'],  # <-- correct key
                    defaults={'holiday_name': item['name']}  # <-- correct key
                )
                self.stdout.write(f"Synced: {item['name']} on {item['date']}")
            self.stdout.write(self.style.SUCCESS("Successfully synced holidays."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error syncing holidays: {str(e)}"))