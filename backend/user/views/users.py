import bcrypt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from user.models.users import CustomUser
from user.models.roles import Role
from user.models.registration_link import RegistrationLink
from user.serializers import UserSerializer, UserProfileSerializer, RegistrationLinkSerializer
from rest_framework.authtoken.models import Token
from user.utils.notification_history import log_notification
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
import os
from django.conf import settings
import re
import secrets
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.db import transaction
from django.utils.timezone import now




# from django.contrib.auth.models import User

class UserCreateView(APIView):
    def get(self, request):
        """Retrieve all non-deleted user records"""
        user = CustomUser.objects.filter(deleted_at__isnull=True)
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # def post(self, request):
    #     """Create a new user record"""
        
    #     request.data.setdefault("role_id", 2)
        
    #     serializer = UserSerializer(data=request.data)
    #     if serializer.is_valid():
            
            
    #         if 'password' in serializer.validated_data:
    #             password = serializer.validated_data['password']
    #             serializer.validated_data['password'] = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                
    #         serializer.save()

    #         log_notification(
    #             user_id=request.user.id,
    #             notification_type="Registered Users",
    #             data={
    #                 "status": "Completed",
    #                 "details": "New Created User",
    #             }
    #         )

    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request):
        """Create a new user record"""
        request.data.setdefault("role_id", 2)

        token = request.data.get("registration_token")
        if not token:
            return Response({'error': 'Registration token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate user registration data
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        password = serializer.validated_data.get('password')
        if password and not re.match(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$', password):
            return Response(
                {"password": ["Password must contain at least 1 uppercase letter, 1 number, and 1 special character."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.validated_data['password'] = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        # Begin atomic transaction
        with transaction.atomic():
            # Save the user
            serializer.save()

            # Mark the token as used
            try:
                reg_link = RegistrationLink.objects.get(registration_token=token, deleted_at__isnull=True)
                reg_link.is_token_used = True
                reg_link.updated_at = now()
                reg_link.save()
            except RegistrationLink.DoesNotExist:
                return Response({'error': 'Invalid registration token.'}, status=status.HTTP_400_BAD_REQUEST)

            log_notification(
                user_id=request.user.id,
                notification_type="Registered Users",
                data={
                    "status": "Completed",
                    "details": "New Created User",
                }
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class UserUpdateDeleteView(APIView):
    def get_object(self, pk):
        """Helper method to get an object or return 404"""
        try:
            return CustomUser.objects.get(pk=pk, deleted_at__isnull=True)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, pk):
        """Retrieve a specific user record"""
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update an User record"""
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=now())

            log_notification(
                user_id=request.user.id,
                notification_type="User Update",
                data={
                    "status": "Completed",
                    "details": "Updated User",
                }
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete an User record"""
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"message": "User record soft deleted"}, status=status.HTTP_204_NO_CONTENT)


## ----------- User Authentication with DRF Throttling ----------- ##
# class LoginThrottle(AnonRateThrottle):
#     scope = 'login'

# class UserAuthenticationView(APIView):
#     """User authentication with DRF throttling"""

#     throttle_classes = [LoginThrottle]
    
#     def post(self, request):
#         """User authentication"""
        
#         username = request.data['username']
#         password = request.data['password']
        
#         if username is None or username.strip() == "":
#             return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

#         if password is None or password.strip() == "":
#             return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             user = CustomUser.objects.get(username=username, deleted_at__isnull=True)
            
#             # Compare hashed password
#             if not bcrypt.checkpw(password.encode(), user.password.encode()):
#                 return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
#             if not user.is_accepted:
#                 return Response({"error": "Your account is not approved yet. Please contact support or try again later."}, status=status.HTTP_403_FORBIDDEN)
            
#             # Create or get authentication token
#             token, created = Token.objects.get_or_create(user=user)
            
#             # Create response object
#             response = Response({
#                 "user_id": user.id, 
#                 "success": True
#             }, status=status.HTTP_200_OK)
            
#             # Set token in HTTP-only cookie
#             response.set_cookie(
#                 'auth_token',
#                 token.key,
#                 httponly=True,
#                 # secure=True,  
#                 # samesite='Strict',
#                 max_age=86400 * 30  # 30 days or adjust as needed
#             )
            
#             return response
            
#         except CustomUser.DoesNotExist:
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class UserAuthenticationView(APIView):
    """User authentication without DRF throttling"""

    def post(self, request):
        """User authentication"""
        
        username = request.data['username']
        password = request.data['password']
        
        if username is None or username.strip() == "":
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

        if password is None or password.strip() == "":
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(username=username, deleted_at__isnull=True)
            
            if not bcrypt.checkpw(password.encode(), user.password.encode()):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_accepted:
                return Response({"error": "Your account is not approved yet. Please contact support or try again later."}, status=status.HTTP_403_FORBIDDEN)
            
            token, created = Token.objects.get_or_create(user=user)
            
            response = Response({
                "first_name": user.first_name,
                "last_name" : user.last_name,
                "position_id" : user.position_id,
                "user_id": user.id,
                "token": token.key,
                "profileImage": request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
                "success": True
            }, status=status.HTTP_200_OK)
            
            # print(f"response", user.first_name)
            
            response.set_cookie(
                'auth_token',
                token.key,
                httponly=True,
                max_age=86400 * 30
            )
            
            return response
            
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class LogoutView(APIView):
            def post(self, request):
                response = Response({"success": True})
                response.delete_cookie('auth_token')
                return response
            
            
class GetUserRoleView(APIView):
    """Get the role of a user via user ID"""

    def get(self, request, user_id):
        try:
            user = CustomUser.objects.get(id=user_id, deleted_at__isnull=True)
            role = Role.objects.get(id=user.role_id)

            return Response({
                "user_id": user.id,
                "role_id": role.id,
                "role_name": role.role_name
            }, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Role.DoesNotExist:
            return Response({"error": "Role not found for user"}, status=status.HTTP_404_NOT_FOUND)
        
class UserCountView(APIView):
    def get(self, request):
        """ User Total Count"""
        user = CustomUser.objects.filter(deleted_at__isnull=True)
        user_count = user.values('id').distinct().count()
        approved_count = user.filter(is_accepted=True).values('id').distinct().count()
        newly_registered_user_count = user.filter(is_accepted=False).values('id').distinct().count()
        
        return Response({
            "count": user_count,
            "approvedUsers": approved_count,
            "newlyRegisteredUsers": newly_registered_user_count,
            }, status=status.HTTP_200_OK)
        
class NewRegistrationRegisteredList(APIView):
    def get(self, request):
        """ Get Newly Registered User Need for Approval"""
        
        user = CustomUser.objects.filter(is_accepted=False, deleted_at__isnull=True)
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AcceptedUserList(APIView):
    def get(self, request):
        """ Get Accepted Users"""
        
        user = CustomUser.objects.filter(is_accepted=True, deleted_at__isnull=True)
        serializer = UserSerializer(user, many=True)

        # Get user_id safely for notification logging
        user_id = request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None
        log_notification(
            user_id=user_id,
            notification_type="Registration Request",
            data={
                "status": "Completed",
                "details": "User Registered",
            }
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    

class UploadProfilePictureView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)

        if 'profile_picture' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Delete the old profile picture if it exists
        if user.profile_picture:
            old_picture_path = user.profile_picture.path
            if os.path.isfile(old_picture_path):
                os.remove(old_picture_path)

        # Assign and save the new profile picture
        user.profile_picture = request.FILES['profile_picture']
        user.save()

        return Response({
            "message": "Profile picture updated",
            "url": user.profile_picture.url
        }, status=status.HTTP_200_OK)

class RemoveProfilePictureView(APIView):
    def post(self, request, user_id):
        user = get_object_or_404(get_user_model(), id=user_id)

        if user.profile_picture:
            # Delete the current image from storage
            user.profile_picture.delete()

        # Clear the profile picture field
        user.profile_picture = None
        user.save()

        return Response({"message": "Profile picture removed successfully."}, status=200)
    
class SendRegistrationLink(APIView):
    def post(self, request):
        email = request.data.get('email')
        base_url = os.getenv("APP_URL")

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        token = get_random_string(32)
        registration_url = f"{base_url}sign-up?token={token}"
        
        serializer = RegistrationLinkSerializer(data={
            'email': email,  # you need to add this field in your serializer + model
            'registration_token': token
        })
        
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        send_mail(
            subject="Your Registration Link",
            message=f"Click here to register: {registration_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        # Optional: Save token in DB or cache with an expiration time

        return Response({'message': 'Registration link sent successfully.'}, status=status.HTTP_200_OK)
