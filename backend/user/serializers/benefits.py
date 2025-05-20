from rest_framework import serializers
from user.models.benefits import BenefitsConfiguration

class BenefitsConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BenefitsConfiguration
        fields = ['benefit_type', 'employee_percentage', 'employer_percentage']
        read_only_fields = ['last_updated']

    def validate(self, data):
        if data['employee_percentage'] < 0 or data['employee_percentage'] > 100:
            raise serializers.ValidationError({
                'employee_percentage': 'Must be between 0 and 100'
            })
        if data['employer_percentage'] < 0 or data['employer_percentage'] > 100:
            raise serializers.ValidationError({
                'employer_percentage': 'Must be between 0 and 100'
            })
        return data