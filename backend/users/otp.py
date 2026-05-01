import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
from .models import OTP, User

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(user):
    otp_code = generate_otp()
    OTP.objects.create(user=user, otp=otp_code)
    
    send_mail(
        "Your OTP Code",
        f"Your OTP is: {otp_code}\nValid for 5 minutes.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    return otp_code

def verify_otp(email, otp_code):
    try:
        user = User.objects.get(email=email)
        otp_obj = OTP.objects.filter(user=user).latest('created_at')
        
        if otp_obj.is_expired():
            otp_obj.delete()
            return None, "OTP expired"
        
        if otp_obj.otp != otp_code:
            return None, "Invalid OTP"
        
        otp_obj.delete()
        return user, None
    except User.DoesNotExist:
        return None, "User not found"
    except OTP.DoesNotExist:
        return None, "OTP not found"

def cleanup_expired_otps():
    """Delete OTPs older than 5 minutes"""
    expired_threshold = now() - timedelta(minutes=5)
    OTP.objects.filter(created_at__lt=expired_threshold).delete()