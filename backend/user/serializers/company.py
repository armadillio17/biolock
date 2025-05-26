from rest_framework import serializers
from user.models import Company, Location


class CompanySerializer(serializers.ModelSerializer):
    location_detail = LocationSerializer(source='location', read_only=True)
    
    class Meta:
        model = Company
        fields = [
            'id', 
            'name', 
            'location', 
            'location_detail',
            'ip_address', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_name(self, value):
        """
        Check that company name is unique (case-insensitive)
        """
        if Company.objects.filter(name__iexact=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value

    def validate_ip_address(self, value):
        """
        Additional IP address validation if needed
        """
        # The GenericIPAddressField already handles basic validation
        # Add custom validation here if needed
        return value

class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Separate serializer for create/update operations
    """
    class Meta:
        model = Company
        fields = ['name', 'location', 'ip_address']

    def validate_name(self, value):
        if Company.objects.filter(name__iexact=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value