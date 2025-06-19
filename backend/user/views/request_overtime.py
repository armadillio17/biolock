from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from user.models import OvertimeRequest, AttendanceSummary, Attendance
from user.serializers import OvertimeRequestSerializer
from django.utils.timezone import now
from user.models.users import CustomUser


class ApproveOvertimeView(APIView):
    def get(self, request):
        pending_requests = OvertimeRequest.objects.filter(status='pending')
        serializer = OvertimeRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Submit a new overtime request.
        No requested_hours needed.
        Uses today's attendance to determine eligibility (optional).
        """

        # Assume user is passed in the request data or session
        user_id = request.data.get('user_id')  # Or use another method to get the user
        date = request.data.get("date", now().date())

        if not user_id:
            return Response({"error": "Missing user_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Optional: Check if user has valid attendance for that day
        attendance = Attendance.objects.filter(
            user=user,
            clock_in__date=date
        ).first()

        if not attendance or not attendance.clock_out:
            return Response(
                {"error": "No valid attendance record for this date"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate requests
        if OvertimeRequest.objects.filter(user=user, date=date).exists():
            return Response(
                {"error": "Overtime request already exists for this date"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the overtime request
        overtime_request = OvertimeRequest.objects.create(
            user=user,
            date=date,
            status='pending'
        )

        serializer = OvertimeRequestSerializer(overtime_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        if not pk:
            return Response({"error": "Missing request ID"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get("action")
        if action not in ["approve", "reject"]:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            overtime_request = OvertimeRequest.objects.get(pk=pk, status='pending')
        except OvertimeRequest.DoesNotExist:
            return Response(
                {"error": "Overtime request not found or already processed."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Approval/rejection logic
        overtime_request.status = 'approved' if action == 'approve' else 'rejected'

        # Optionally set approved_by if you have an approver field
        # overtime_request.approved_by = some_user

        overtime_request.save()

        status_msg = "approved" if action == "approve" else "rejected"
        return Response({"status": f"Overtime {status_msg}"})