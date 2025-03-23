from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from user.models.department import Department, DepartmentUser
from user.serializers import DepartmentSerializer, AssignUserDepartmentSerializer


class DepartmentListCreateView(APIView):
    """List all departments or create a new one"""

    def get(self, request):
        """Retrieve all departments"""
        departments = Department.objects.filter(deleted_at__isnull=True)
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new department"""
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DepartmentDetailView(APIView):
    """Retrieve, update, or delete a department"""

    def get_object(self, pk):
        """Helper method to get a department instance"""
        try:
            return Department.objects.get(pk=pk, deleted_at__isnull=True)
        except Department.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a single department"""
        department = self.get_object(pk)
        if not department:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(department)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a department"""
        department = self.get_object(pk)
        if not department:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a department"""
        department = self.get_object(pk)
        if not department:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        department.delete()
        return Response({"message": "Department deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class AssignUserToDepartmentView(APIView):
    """Manually assign a user to a department"""

    def post(self, request, department_id):
        """Assign a user to a department"""
        serializer = AssignUserDepartmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data['user_id']

        try:
            department = Department.objects.get(id=department_id, deleted_at__isnull=True)
            user = User.objects.get(id=user_id)
            _, created = DepartmentUser.objects.get_or_create(department=department, user=user)

            if created:
                return Response({"message": "User assigned successfully"}, status=status.HTTP_201_CREATED)
            return Response({"message": "User is already assigned"}, status=status.HTTP_200_OK)

        except (Department.DoesNotExist, User.DoesNotExist):
            return Response({"error": "Department or User not found"}, status=status.HTTP_404_NOT_FOUND)


class RemoveUserFromDepartmentView(APIView):
    """Manually remove a user from a department"""

    def delete(self, request, department_id):
        """Remove a user from a department"""
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            department = Department.objects.get(id=department_id, deleted_at__isnull=True)
            user = User.objects.get(id=user_id)
            department_user = DepartmentUser.objects.get(department=department, user=user)
            department_user.delete()
            return Response({"message": "User removed successfully"}, status=status.HTTP_200_OK)

        except (Department.DoesNotExist, User.DoesNotExist, DepartmentUser.DoesNotExist):
            return Response({"error": "User not found in department"}, status=status.HTTP_404_NOT_FOUND)
