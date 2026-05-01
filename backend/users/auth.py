from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

def create_user(email, password):
    # Generate username from email
    username = email.split("@")[0]
    user = User(
        email=email,
        username=username,
        password=make_password(password),
    )
    user.save()
    return user

def authenticate_user(email, password):
    try:
        user = User.objects.get(email=email)
        if check_password(password, user.password):
            return user
    except User.DoesNotExist:
        pass
    return None

def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

def get_user_from_token(validated_token):
    user_id = validated_token.payload.get('user_id')
    return User.objects.get(id=user_id)