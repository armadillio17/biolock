from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.holiday import Holiday
from user.serializers import HolidaySerializer
from user.models.holiday_config import HolidayConfig
from user.serializers.holiday_config import HolidayConfigSerializer
from datetime import datetime

class HolidayListCreateView(APIView):
    """List all holidays or create a new one"""

    def get(self, request):
        """Retrieve all holidays for the current year (excluding soft-deleted ones)"""
        current_year = datetime.now().year

        # Filter holidays where holiday_date is in the current year
        holidays = Holiday.objects.filter(
            deleted_at__isnull=True,
            holiday_date__year=current_year
        )

        serializer = HolidaySerializer(holidays, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


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

    # def put(self, request, pk):
    #     """Update a holiday"""
    #     holiday = self.get_object(pk)
    #     if not holiday:
    #         return Response({"error": "Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
    #     serializer = HolidaySerializer(holiday, data=request.data, partial=True)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, pk):
    #     """Soft delete a holiday"""
    #     holiday = self.get_object(pk)
    #     if not holiday:
    #         return Response({"error": "Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
    #     holiday.delete()  # Calls the overridden `delete` method in the model
    #     return Response({"message": "Holiday deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class HolidayConfigListCreateAPIView(APIView):
    """
    Handle GET (list) and POST (create)
    """

    def get(self, request, *args, **kwargs):
        configs = HolidayConfig.objects.all()
        serializer = HolidayConfigSerializer(configs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = HolidayConfigSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HolidayConfigDetailAPIView(APIView):
    """
    Handle GET (detail), PUT, PATCH, DELETE
    """

    def get_object(self, pk):
        try:
            return HolidayConfig.objects.get(pk=pk)
        except HolidayConfig.DoesNotExist:
            return None

    def get(self, request, pk, *args, **kwargs):
        config = self.get_object(pk)
        if not config:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = HolidayConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):
        config = self.get_object(pk)
        if not config:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = HolidayConfigSerializer(config, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        config = self.get_object(pk)
        if not config:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = HolidayConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        config = self.get_object(pk)
        if not config:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        config.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
