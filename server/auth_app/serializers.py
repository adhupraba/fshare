import base64

from rest_framework import serializers
from cryptography.hazmat.primitives import serialization

from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import authenticate

from . import validators
from .models import User
from .utils import (
    encrypt_mfa_secret,
    generate_mfa_secret,
    generate_rsa_key_pair,
    encrypt_private_key,
)


class UserRegisterSerializer(serializers.ModelSerializer):
    master_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password", "master_password", "name"]
        extra_kwargs = {"email": {"required": True}}

    def validate_name(self, value):
        return validators.validate_name(value)

    def validate_username(self, value):
        return validators.validate_username(value)

    def validate_password(self, value):
        return validators.validate_password(value)

    def validate_master_password(self, value):
        return validators.validate_master_password(value)

    def create(self, validated_data):
        name = validated_data["name"]
        username = validated_data["username"]
        email = validated_data["email"].lower()
        password = validated_data["password"]
        master_password = validated_data["master_password"]
        role = "user"
        mfa_secret = encrypt_mfa_secret(generate_mfa_secret())
        mfa_enabled = False

        private_key, public_key = generate_rsa_key_pair()
        enc_priv_key_binary = encrypt_private_key(private_key, master_password)
        enc_priv_key = base64.b64encode(enc_priv_key_binary).decode("utf-8")
        public_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")

        user = User(
            name=name,
            password=make_password(password),
            username=username,
            email=email,
            role=role,
            mfa_secret=mfa_secret,
            mfa_enabled=mfa_enabled,
            master_password_hash=make_password(master_password),
            encrypted_private_key=enc_priv_key,
            public_key=public_key,
        )

        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        return validators.validate_password(value)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        attrs["user"] = user
        return attrs


class GetEncPrivateKeySerializer(serializers.Serializer):
    master_password = serializers.CharField(write_only=True)

    def validate_master_password(self, value):
        return validators.validate_password(value)

    def validate(self, attrs):
        user = self.context.get("user", None)

        if not user:
            raise serializers.ValidationError("User is not authenticated.")

        mp = attrs.get("master_password")
        is_verified = check_password(mp, user.master_password_hash)

        if not is_verified:
            raise serializers.ValidationError("Invalid credential.")

        return attrs


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)
    role = serializers.ChoiceField(
        required=False, choices=User._meta.get_field("role").choices
    )
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ["id", "role", "is_active"]

    def validate_id(self, value):
        user = self.context.get("user", None)

        if not user:
            raise serializers.ValidationError("User is not authenticated.")

        if user.id == value:
            raise serializers.ValidationError("User cannot update one's own data.")

        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User with this id does not exist.")

        return value

    def validate(self, attrs):
        if (attrs.get("role") is not None) and (attrs.get("is_active") is not None):
            raise serializers.ValidationError(
                "Valid data must be provided to update a user's data."
            )

        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "username", "email", "role", "is_active"]
