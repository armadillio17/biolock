from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.models.benefits import BenefitsConfiguration
from user.serializers.benefits import BenefitsConfigurationSerializer

class BenefitsConfigurationAPIView(APIView):
    def get(self, request, benefit_type=None, format=None):
        if benefit_type:
            try:
                config = BenefitsConfiguration.objects.get(benefit_type=benefit_type)
                serializer = BenefitsConfigurationSerializer(config)
                return Response(serializer.data)
            except BenefitsConfiguration.DoesNotExist:
                return Response(
                    {'detail': 'Configuration not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            configs = BenefitsConfiguration.objects.all().order_by('benefit_type')
            serializer = BenefitsConfigurationSerializer(configs, many=True)
            return Response(serializer.data)

    def post(self, request, format=None):
        serializer = BenefitsConfigurationSerializer(data=request.data)
        if serializer.is_valid():
            benefit_type = serializer.validated_data.get('benefit_type')
            if BenefitsConfiguration.objects.filter(benefit_type=benefit_type).exists():
                return Response(
                    {'detail': f'{benefit_type} configuration already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, benefit_type, format=None):
        try:
            config = BenefitsConfiguration.objects.get(benefit_type=benefit_type)
        except BenefitsConfiguration.DoesNotExist:
            return Response(
                {'detail': 'Configuration not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = BenefitsConfigurationSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)