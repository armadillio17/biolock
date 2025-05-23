from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.models import UserSalary, CustomUser
from user.serializers.user_salary import UserSalarySerializer
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

class UserSalaryListCreateView(APIView):
    def get(self, request):
        salaries = UserSalary.objects.filter(deleted_at__isnull=True)
        serializer = UserSalarySerializer(salaries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSalarySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserSalaryDetailView(APIView):
    def get_object(self, pk):
        return get_object_or_404(UserSalary, pk=pk, deleted_at__isnull=True)

    def get(self, request, pk):
        salary = self.get_object(pk)
        serializer = UserSalarySerializer(salary)
        return Response(serializer.data)

    def put(self, request, pk):
        salary = self.get_object(pk)
        serializer = UserSalarySerializer(salary, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        salary = self.get_object(pk)
        serializer = UserSalarySerializer(salary, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        salary = self.get_object(pk)
        salary.deleted_at = now()
        salary.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
