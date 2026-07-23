from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import DeviceToken
from user.serializers import DeviceTokenSerializer


class DeviceTokenView(APIView):
    """
    API endpoint for registering and managing FCM device tokens.
    """

    def post(self, request):
        """Register or update a device token."""
        serializer = DeviceTokenSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Deactivate a device token (e.g., on logout)."""
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            device_token = DeviceToken.objects.get(token=token)
            device_token.is_active = False
            device_token.save()
            return Response(
                {'message': 'Token deactivated successfully'},
                status=status.HTTP_200_OK
            )
        except DeviceToken.DoesNotExist:
            return Response(
                {'error': 'Token not found'},
                status=status.HTTP_404_NOT_FOUND
            )
