from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from user.models.roles import Role
from user.serializers import RoleSerializer

class RoleListCreateView(generics.ListCreateAPIView):
    """List all roles and create a new role."""
    queryset = Role.objects.filter(deleted_at__isnull=True)
    serializer_class = RoleSerializer

    def create(self, request, *args, **kwargs):
        """Handle role creation with validation."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleUpdateDeleteView(APIView):
    """Retrieve, update, or delete a role."""
    
    def get_object(self, pk):
        """Retrieve a role by ID."""
        role = get_object_or_404(Role, pk=pk)
        if role.is_deleted:
            return Response({"error": "This role is deleted."}, status=status.HTTP_404_NOT_FOUND)
        return role

    def put(self, request, pk):
        """Update an existing role."""
        role = self.get_object(pk)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a role."""
        role = self.get_object(pk)
        role.delete()
        return Response({"message": "Role deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
