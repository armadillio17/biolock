from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from user.models.leave_request import LeaveRequest
from user.models.users import CustomUser
from user.serializers import LeaveRequestSerializer, UserProfileSerializer
from user.utils.system_history import log_notification 
from datetime import datetime
from rest_framework import generics, filters


class LeaveRequestSearchListView(generics.ListAPIView):
    """Searchable and orderable leave request list view"""
    queryset = LeaveRequest.objects.filter(deleted_at__isnull=True)
    serializer_class = LeaveRequestSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    # Searchable fields
    search_fields = [
        'user__first_name',
        'user__last_name',
        'type',
        'status',
        'start_date',
        'end_date',
    ]

    # Ordering
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']
    
class LeaveRequestListCreateView(APIView):
    """List all leave requests or create a new one"""

    # def get(self, request):
    #     """Retrieve all leave requests (excluding soft-deleted ones)"""
    #     leave_requests = LeaveRequest.objects.filter(deleted_at__isnull=True)
    #     user_data = []
        
    #     for leave_request in leave_requests:
    #         user_serializer = UserProfileSerializer(leave_request.user_id)
    #         user_data = user_serializer.data
            
    #         leave_request_data = LeaveRequestSerializer(leave_request).data
    #         leave_request_data['user'] = user_data
            
    #         user_data.append(leave_request_data)
    #     serializer = LeaveRequestSerializer(leave_requests, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)
    def get(self, request):
        """Retrieve all leave requests (excluding soft-deleted ones)"""
        leave_requests = LeaveRequest.objects.filter(deleted_at__isnull=True)
        leave_data = []  # Store the leave request data here
        
        for leave_request in leave_requests:
            # Serialize user data (first and last name)
            user_serializer = UserProfileSerializer(leave_request.user)
            user_data = user_serializer.data
            
            # Serialize the leave request data
            leave_request_data = LeaveRequestSerializer(leave_request).data
            
            # Add the user data to the leave request data
            leave_request_data['user'] = user_data
            
            # Append the complete leave request data to the leave_data list
            leave_data.append(leave_request_data)

        return Response(leave_data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new leave request and log a notification"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Optionally, you can check if the user exists, but it's not strictly necessary unless you want to validate:
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Now you can create a leave request with the user_id
        serializer = LeaveRequestSerializer(data=request.data)
        if serializer.is_valid():
            leave_request = serializer.save(user=user)

            # Log a notification for the created leave request
            log_notification(
                user_id=user.id,  # The user associated with the leave request
                notification_type="Leave Request",
                data={
                    "status": leave_request.status,
                    "details": leave_request.details
                }
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LeaveRequestDetailView(APIView):
    """Retrieve, update, or delete a specific leave request"""

    def get_object(self, pk):
        """Helper method to get a leave request instance"""
        try:
            return LeaveRequest.objects.get(pk=pk, deleted_at__isnull=True)
        except LeaveRequest.DoesNotExist:
            return None

    def get(self, request, pk, date):
        """Retrieve a single leave request"""
        # leave_request = self.get_object(pk)
        
        try:
            formatted_date = datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        
        leave_request = LeaveRequest.objects.filter(user_id=pk, start_date__lte=formatted_date, deleted_at__isnull=True)
        # if not leave_request:
        #     return Response({"error": "Leave request not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = LeaveRequestSerializer(leave_request, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update a leave request and log a notification"""
        leave_request = self.get_object(pk)
        if not leave_request:
            return Response({"error": "Leave request not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LeaveRequestSerializer(leave_request, data=request.data, partial=True)
        if serializer.is_valid():
            updated_leave_request = serializer.save()

            # Log a notification for the updated leave request
            log_notification(
                user_id=updated_leave_request.user_id,
                notification_type="Leave Request",
                data={
                    "status": updated_leave_request.status,
                    "details": updated_leave_request.details
                }
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a leave request and log a notification"""
        leave_request = self.get_object(pk)
        if not leave_request:
            return Response({"error": "Leave request not found"}, status=status.HTTP_404_NOT_FOUND)

        leave_request.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
class LeaveRequestCountView(APIView):
    """Count all Leave Request not approved"""

    def get(self, request):
        """Retrieve all leave requests (excluding soft-deleted ones)"""
        leave_requests = LeaveRequest.objects.filter(deleted_at__isnull=True)
        # serializer = LeaveRequestSerializer(leave_requests, many=True)
        approved_count = leave_requests.filter(status="pending").values('id').distinct().count()
        
        return Response({
            "approvedLeaveCount": approved_count
            }, status=status.HTTP_200_OK)
        
class LeaveRequestListView(APIView):
    """Retrieve leave requests for a specific user"""
    
    def get(self, request, user_id):
        """Get all leave requests for a user"""
        date_param = request.query_params.get('date')
        
        queryset = LeaveRequest.objects.filter(
            user_id=user_id, 
            deleted_at__isnull=True
        )
        
        if date_param:
            try:
                formatted_date = datetime.strptime(date_param, '%Y-%m-%d')
                queryset = queryset.filter(start_date__lte=formatted_date)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = LeaveRequestSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)