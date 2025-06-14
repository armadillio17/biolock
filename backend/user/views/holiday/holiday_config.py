from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import HolidayConfig
from user.serializers import HolidayConfigSerializer

class HolidayConfigListCreateAPIView(APIView):
    """
    Handle GET (list) and POST (create)
    Supports both:
        - Bulk creation (for Holiday)
        - Single creation (for CustomHoliday)
    """

    def get(self, request, *args, **kwargs):
        configs = HolidayConfig.objects.all()
        serializer = HolidayConfigSerializer(configs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Detect whether data is a list or dict
        many = isinstance(request.data, list)

        serializer = HolidayConfigSerializer(
            data=request.data,
            many=many  # 🚀 dynamic toggle
        )

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
