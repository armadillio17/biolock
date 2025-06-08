from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.utils.ping_public_ip import ping_public_ip  # Your ping function

class PingCompany(APIView):
    def post(self, request, *args, **kwargs):
        ip = request.data.get('ip')
        if not ip:
            return Response({"error": "IP address is required"}, status=status.HTTP_400_BAD_REQUEST)

        result = ping_public_ip(ip)
        return Response(result)