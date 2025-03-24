# user/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token

class CookieTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_token = request.COOKIES.get('auth_token')
        if not auth_token:
            return None

        try:
            token = Token.objects.get(key=auth_token)
            return (token.user, token)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token')