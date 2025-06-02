from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from user.models import Company
from user.serializers.company import CompanySerializer
from rest_framework.views import APIView
from django.utils.timezone import now

class CompanyListView(APIView):
    def get(self, request):
        """Retrieve all non-deleted attendance records"""
        attendances = Company.objects.filter(deleted_at__isnull=True)
        serializer = CompanySerializer(attendances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def create_company_ip(self, request):
        """Create a new attendance record"""
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CompanyUpdateDeleteView(APIView):
    def get_object(self, pk):
        try:
            return Company.objects.get(pk=pk, deleted_at_isnull=True)
        except Company.DoesNotExist:
            return None
    
    def put(self, request, pk):
        """Update an company record"""
        company = self.get_object(pk)
        if company  is None:
            return Response({"error": "Company Not Found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=now())
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    def delete(self, request, pk):
        """Soft delete an company record"""
        company = self.get_object(pk)
        if company is None:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        company.delete()
        return Response({"message": "Company record soft deleted"}, status=status.HTTP_204_NO_CONTENT)
    