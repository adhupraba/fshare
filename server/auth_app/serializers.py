from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "email", "password", "role"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User(
            name=validated_data["name"],
            email=validated_data["email"].lower(),
            role=validated_data.get("role", "user"),
        )
        user.password = make_password(validated_data["password"])
        user.save()
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "name", "role"]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    totp_code = serializers.CharField(required=False, allow_blank=True)
