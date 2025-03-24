import bcrypt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from user.models.users import CustomUser
from user.models.roles import Role
from user.serializers import UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

# from django.contrib.auth.models import User

class UserCreateView(APIView):
    def get(self, request):
        """Retrieve all non-deleted user records"""
        user = CustomUser.objects.filter(deleted_at__isnull=True)
        serializer = UserSerializer(user, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new user record"""
        
        request.data.setdefault("role_id", 2)
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            
            if 'password' in serializer.validated_data:
                password = serializer.validated_data['password']
                serializer.validated_data['password'] = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Update an User record"""
        user = self.get_object(pk)
        if user is None:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=now())
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
class LoginThrottle(AnonRateThrottle):
    scope = 'login'

class UserAuthenticationView(APIView):
    """User authentication with DRF throttling"""

    throttle_classes = [LoginThrottle]
    
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

            # Compare hashed password
            if not bcrypt.checkpw(password.encode(), user.password.encode()):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Create or get authentication token
            token, created = Token.objects.get_or_create(user=user)
            
            # Create response object
            response = Response({
                "user_id": user.id, 
                "success": True
            }, status=status.HTTP_200_OK)
            
            # Set token in HTTP-only cookie
            response.set_cookie(
                'auth_token',
                token.key,
                httponly=True,
                # secure=True,  
                # samesite='Strict',
                max_age=86400 * 30  # 30 days or adjust as needed
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
