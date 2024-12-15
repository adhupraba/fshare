from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User
from cryptography.hazmat.primitives import serialization
from django.contrib.auth import authenticate
from .utils import generate_mfa_secret, generate_rsa_key_pair, encrypt_private_key
from . import validators


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
        mfa_secret = generate_mfa_secret()
        mfa_enabled = False

        private_key, public_key = generate_rsa_key_pair()
        enc_priv_key = encrypt_private_key(private_key, master_password)
        public_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

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
