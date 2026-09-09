from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import CustomHoliday
from user.serializers import CustomHolidaySerializer
from datetime import datetime
from django.utils.timezone import localdate

class CustomHolidayListCreateView(APIView):
    """List all custom holidays or create a new one"""

    def get(self, request):
        """Retrieve all custom holidays for the current year (excluding soft-deleted ones)"""
        current_year = localdate().year

        # Filter holidays where holiday_date is in the current year
        custom_holidays = CustomHoliday.objects.filter(
            deleted_at__isnull=True,
            custom_holiday_date__year=current_year
        )

        serializer = CustomHolidaySerializer(custom_holidays, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        serializer = CustomHolidaySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomHolidayDetailView(APIView):
    """Retrieve, update, or delete a specific custom holiday"""

    def get_object(self, pk):
        """Helper method to get a custom holiday instance"""
        try:
            return CustomHoliday.objects.get(pk=pk, deleted_at__isnull=True)
        except CustomHoliday.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single holiday"""
        custom_holiday = self.get_object(pk)
        if not custom_holiday:
            return Response({"error": "Custom Holiday not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CustomHolidaySerializer(custom_holiday)
        return Response(serializer.data, status=status.HTTP_200_OK)