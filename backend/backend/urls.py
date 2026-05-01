"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from users.views import SignupView, VerifyOTPView, CompleteProfileView, upload_avatar_view, LoginView, user_profile

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/signup/", SignupView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/verify-otp/", VerifyOTPView.as_view()),
    path("api/users/complete-profile/", CompleteProfileView.as_view()),
    path("api/users/upload-avatar/", upload_avatar_view),
    path("api/users/profile/", user_profile),
    path("api/", include("posts.urls")),
]
