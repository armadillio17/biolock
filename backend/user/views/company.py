from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from user.models import Company, Location
from .serializers import CompanySerializer, CompanyCreateUpdateSerializer, LocationSerializer

class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company CRUD operations
    """
    queryset = Company.objects.select_related('location').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location']
    search_fields = ['name', 'ip_address', 'location__name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        return CompanySerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new company
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        
        # Return full company data with location details
        response_serializer = CompanySerializer(company)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Update a company
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        
        # Return full company data with location details
        response_serializer = CompanySerializer(company)
        return Response(response_serializer.data)

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """
        Custom endpoint to get companies by location ID
        Usage: /api/companies/by_location/?location_id=1
        """
        location_id = request.query_params.get('location_id')
        if not location_id:
            return Response(
                {'error': 'location_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        companies = self.queryset.filter(location_id=location_id)
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search_advanced(self, request):
        """
        Advanced search endpoint
        Usage: /api/companies/search_advanced/?q=searchterm
        """
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'q parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        companies = self.queryset.filter(
            Q(name__icontains=query) |
            Q(ip_address__icontains=query) |
            Q(location__name__icontains=query)
        )
        
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for Location (for dropdown/selection purposes)
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    ordering = ['name']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']