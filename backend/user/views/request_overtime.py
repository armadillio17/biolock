from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from user.models import OvertimeRequest, AttendanceSummary
from django.contrib.auth import get_user_model
from user.serializers import OvertimeRequestSerializer  # <-- Import here
from rest_framework.authtoken.models import Token
User = get_user_model()

class ApproveOvertimeView(APIView):
    def get(self, request):
        pending_requests = OvertimeRequest.objects.filter(status='pending')
        serializer = OvertimeRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def put(self, request, pk=None):
        if not pk:
            return Response({"error": "Missing request ID"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        token_key = request.COOKIES.get('auth_token')
        if not token_key:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = Token.objects.get(key=token_key)
            user = token.user
        except Token.DoesNotExist:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            overtime_request = OvertimeRequest.objects.get(pk=pk, status='pending')
        except OvertimeRequest.DoesNotExist:
            return Response(
                {"error": "Overtime request not found or already processed."},
                status=status.HTTP_404_NOT_FOUND
            )

        if action == "approve":
            summary, created = AttendanceSummary.objects.get_or_create(
                user=overtime_request.user,
                date=overtime_request.date,
                defaults={"total_overtime_hours": overtime_request.requested_hours}
            )
            if not created:
                summary.total_overtime_hours += overtime_request.requested_hours
                summary.save()
            overtime_request.status = 'approved'
        elif action == "reject":
            overtime_request.status = 'rejected'

        overtime_request.approved_by = user
        overtime_request.save()

        status_msg = "approved" if action == "approve" else "rejected"
        return Response({"status": f"Overtime {status_msg}"})