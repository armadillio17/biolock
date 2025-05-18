from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models import PayrollPeriod
from user.serializers import PayrollPeriodSerializer

class PayrollPeriodListCreateView(APIView):
    def get(self, request, *args, **kwargs):
        """List all payroll periods."""
        payroll_periods = PayrollPeriod.objects.all()
        serializer = PayrollPeriodSerializer(payroll_periods, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Create a new payroll period."""
        serializer = PayrollPeriodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PayrollPeriodDetailView(APIView):
    def get_object(self, pk):
        """Get payroll period by ID."""
        try:
            return PayrollPeriod.objects.get(pk=pk)
        except PayrollPeriod.DoesNotExist:
            return None

    def get(self, request, pk, *args, **kwargs):
        """Retrieve a specific payroll period."""
        payroll_period = self.get_object(pk)
        if payroll_period is not None:
            serializer = PayrollPeriodSerializer(payroll_period)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": "Payroll period not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk, *args, **kwargs):
        """Update a specific payroll period."""
        payroll_period = self.get_object(pk)
        if payroll_period is not None:
            serializer = PayrollPeriodSerializer(payroll_period, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": "Payroll period not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, *args, **kwargs):
        """Delete a specific payroll period."""
        payroll_period = self.get_object(pk)
        if payroll_period is not None:
            payroll_period.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Payroll period not found"}, status=status.HTTP_404_NOT_FOUND)
