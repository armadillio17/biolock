from rest_framework import serializers
from user.models.location import Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "latitude", "longitude", "radius", "is_active", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

    def validate_latitude(self, value):
        if not (-90 <= float(value) <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if not (-180 <= float(value) <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def validate_radius(self, value):
        if value < 20:
            raise serializers.ValidationError("Radius must be at least 20 meters to allow for GPS drift.")
        if value > 50000:
            raise serializers.ValidationError("Radius must be 50000 meters or less.")
        return value
