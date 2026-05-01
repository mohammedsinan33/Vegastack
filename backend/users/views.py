from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now
from .models import User, OTP
from .serializers import SignupSerializer, VerifyOTPSerializer, CompleteProfileSerializer
from .otp import send_otp_email, verify_otp
from .auth import create_user, get_tokens, authenticate_user
from .storage import upload_avatar
import random
import logging

logger = logging.getLogger(__name__)

def generate_otp():
    return random.randint(100000, 999999)

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = create_user(serializer.validated_data["email"], serializer.validated_data["password"])
        
        otp_code = generate_otp()
        from .models import OTP
        OTP.objects.create(user=user, otp=otp_code)
        send_otp_email(user)
        
        return Response(
            {"message": "OTP sent to your email", "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user, error = verify_otp(serializer.validated_data["email"], serializer.validated_data["otp"])
        
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
        
        tokens = get_tokens(user)
        return Response({
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "email": user.email,
        })


class CompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = CompleteProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print("Serializer errors:", serializer.errors)  # Debug logging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar_view(request):
    try:
        file = request.FILES.get('avatar')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        avatar_url = upload_avatar(file, str(request.user.id))
        if not avatar_url:
            return Response({"error": "Upload failed - check server logs"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"avatar_url": avatar_url})
    except Exception as e:
        logger.error(f"Upload view error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate_user(email, password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Return tokens directly - no OTP needed for login
        tokens = get_tokens(user)
        return Response({
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "email": user.email,
        })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user's profile"""
    user = request.user
    return Response({
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "avatar_url": user.avatar_url or "",
        "bio": user.bio or "",
        "website": user.website or "",
        "location": user.location or "",
        "followers_count": user.followers.count(),
        "following_count": user.following.count(),
        "posts_count": user.posts.count(),
    })
