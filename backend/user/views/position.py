from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from user.models.position import Department, Position, DepartmentPosition, PositionUser
from user.serializers import PositionSerializer, AssignUserPositionSerializer


class PositionListCreateView(APIView):
    """List all positions or create a new one"""

    def get(self, request):
        """Retrieve all positions"""
        positions = Position.objects.filter(deleted_at__isnull=True)
        serializer = PositionSerializer(positions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new position"""
        serializer = PositionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PositionDetailView(APIView):
    """Retrieve, update, or delete a position"""

    def get_object(self, pk):
        """Helper method to get a position instance"""
        try:
            return Position.objects.get(pk=pk, deleted_at__isnull=True)
        except Position.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single position"""
        position = self.get_object(pk)
        if not position:
            return Response({"error": "Position not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PositionSerializer(position)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a position"""
        position = self.get_object(pk)
        if not position:
            return Response({"error": "Position not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PositionSerializer(position, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a position"""
        position = self.get_object(pk)
        if not position:
            return Response({"error": "Position not found"}, status=status.HTTP_404_NOT_FOUND)
        position.delete()
        return Response({"message": "Position deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class AssignUserToPositionView(APIView):
    """Manually assign a user to a position within a department"""

    def post(self, request, department_id, position_id):
        """Assign a user to a position within a department"""
        serializer = AssignUserPositionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data['user_id']

        try:
            # Ensure the department and position exist and are linked
            department = Department.objects.get(id=department_id, deleted_at__isnull=True)
            position = Position.objects.get(id=position_id, deleted_at__isnull=True)
            department_position = DepartmentPosition.objects.get(department=department, position=position)

            # Assign the user to the position
            user = User.objects.get(id=user_id)
            _, created = PositionUser.objects.get_or_create(department_position=department_position, user=user)

            if created:
                return Response({"message": "User assigned to position successfully"}, status=status.HTTP_201_CREATED)
            return Response({"message": "User is already assigned to this position"}, status=status.HTTP_200_OK)

        except (Department.DoesNotExist, Position.DoesNotExist, DepartmentPosition.DoesNotExist):
            return Response({"error": "Department, Position, or Department-Position link not found"}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class RemoveUserFromPositionView(APIView):
    """Manually remove a user from a position within a department"""

    def delete(self, request, department_id, position_id):
        """Remove a user from a position within a department"""
        serializer = AssignUserPositionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data['user_id']

        try:
            # Ensure the department and position exist and are linked
            department = Department.objects.get(id=department_id, deleted_at__isnull=True)
            position = Position.objects.get(id=position_id, deleted_at__isnull=True)
            department_position = DepartmentPosition.objects.get(department=department, position=position)

            # Remove the user from the position
            user = User.objects.get(id=user_id)
            position_user = PositionUser.objects.get(department_position=department_position, user=user)
            position_user.delete()
            return Response({"message": "User removed from position successfully"}, status=status.HTTP_200_OK)

        except (Department.DoesNotExist, Position.DoesNotExist, DepartmentPosition.DoesNotExist):
            return Response({"error": "Department, Position, or Department-Position link not found"}, status=status.HTTP_404_NOT_FOUND)
        except (User.DoesNotExist, PositionUser.DoesNotExist):
            return Response({"error": "User not found in this position"}, status=status.HTTP_404_NOT_FOUND)