from django.utils.timezone import now
from django.conf import settings
from django.shortcuts import redirect

class AutoLogoutMiddleware:
    """Middleware to log out idle users after inactivity."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            return self.get_response(request)

        last_activity = request.session.get('last_activity')

        if last_activity:
            idle_time = (now() - last_activity).seconds
            if idle_time > settings.SESSION_COOKIE_AGE:
                del request.session['last_activity']
                return redirect('/logout/')  # Redirect to logout page

        request.session['last_activity'] = now()

        return self.get_response(request)
