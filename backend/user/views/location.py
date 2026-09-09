from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from user.models.location import Location
from user.serializers.location import LocationSerializer


class LocationListCreateView(APIView):
    """List all geofenced locations or create a new one"""

    def get(self, request):
        """Retrieve all locations. Pass ?active=true for only the enforced ones."""
        locations = Location.objects.all().order_by("name")
        if request.query_params.get("active") == "true":
            locations = locations.filter(is_active=True)
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new location"""
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocationDetailView(APIView):
    """Retrieve, update, or delete a location"""

    def get_object(self, pk):
        """Helper method to get a location instance"""
        try:
            return Location.objects.get(pk=pk)
        except Location.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single location"""
        location = self.get_object(pk)
        if not location:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a location"""
        location = self.get_object(pk)
        if not location:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LocationSerializer(location, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete a location"""
        location = self.get_object(pk)
        if not location:
            return Response({"error": "Location not found"}, status=status.HTTP_404_NOT_FOUND)
        location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
