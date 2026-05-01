from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from .models import User, OTP
import random

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
            password=make_password(validated_data["password"]),
        )
        user.save()
        return user


class OTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)


class CompleteProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.ListField(child=serializers.CharField(), required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ("first_name", "last_name", "bio", "avatar_url", "website", "location", "interests")

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name') or instance.first_name
        instance.last_name = validated_data.get('last_name') or instance.last_name
        instance.bio = validated_data.get('bio') or instance.bio
        instance.avatar_url = validated_data.get('avatar_url') or None
        instance.website = validated_data.get('website') or None
        instance.location = validated_data.get('location') or instance.location
        instance.interests = validated_data.get('interests') or instance.interests or []
        instance.is_profile_complete = True
        instance.save()
        return instance