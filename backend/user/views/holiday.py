from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.holiday import Holiday
from user.serializers import HolidaySerializer

class HolidayListCreateView(APIView):
    """List all holidays or create a new one"""

    def get(self, request):
        """Retrieve all holidays (excluding soft-deleted ones)"""
        holidays = Holiday.objects.filter(deleted_at__isnull=True)
        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new holiday"""
        serializer = HolidaySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HolidayDetailView(APIView):
    """Retrieve, update, or delete a specific holiday"""

    def get_object(self, pk):
        """Helper method to get a holiday instance"""
        try:
            return Holiday.objects.get(pk=pk, deleted_at__isnull=True)
        except Holiday.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single holiday"""
        holiday = self.get_object(pk)
        if not holiday:
            return Response({"error": "Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = HolidaySerializer(holiday)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a holiday"""
        holiday = self.get_object(pk)
        if not holiday:
            return Response({"error": "Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = HolidaySerializer(holiday, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a holiday"""
        holiday = self.get_object(pk)
        if not holiday:
            return Response({"error": "Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
        holiday.delete()  # Calls the overridden `delete` method in the model
        return Response({"message": "Holiday deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
