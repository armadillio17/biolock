from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.notification_history import NotificationHistory
from user.serializers import NotificationHistorySerializer


class NotificationHistoryListCreateView(APIView):
    """List all notifications or create a new one"""

    def get(self, request):
        """Retrieve all notifications (excluding soft-deleted ones)"""
        notifications = NotificationHistory.objects.filter(deleted_at__isnull=True)
        serializer = NotificationHistorySerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new notification"""
        serializer = NotificationHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationHistoryDetailView(APIView):
    """Retrieve, update, or delete a specific notification"""

    def get_object(self, pk):
        """Helper method to get a notification instance"""
        try:
            return NotificationHistory.objects.get(pk=pk, deleted_at__isnull=True)
        except NotificationHistory.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single notification"""
        notification = self.get_object(pk)
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationHistorySerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a notification"""
        notification = self.get_object(pk)
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = NotificationHistorySerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a notification"""
        notification = self.get_object(pk)
        if not notification:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        notification.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Notification deleted successfully"}, status=status.HTTP_204_NO_CONTENT)