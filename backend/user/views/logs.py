from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.logs import Logs
from user.serializers import LogsSerializer

class LogsListCreateView(APIView):
    """List all logs or create a new one"""

    def get(self, request):
        """Retrieve all logs (excluding soft-deleted ones)"""
        logs = Logs.objects.filter(deleted_at__isnull=True)
        serializer = LogsSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new log entry"""
        serializer = LogsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogsDetailView(APIView):
    """Retrieve, update, or delete a specific log entry"""

    def get_object(self, pk):
        """Helper method to get a log entry instance"""
        try:
            return Logs.objects.get(pk=pk, deleted_at__isnull=True)
        except Logs.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single log entry"""
        log = self.get_object(pk)
        if not log:
            return Response({"error": "Log entry not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LogsSerializer(log)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a log entry"""
        log = self.get_object(pk)
        if not log:
            return Response({"error": "Log entry not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LogsSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a log entry"""
        log = self.get_object(pk)
        if not log:
            return Response({"error": "Log entry not found"}, status=status.HTTP_404_NOT_FOUND)
        log.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Log entry deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
