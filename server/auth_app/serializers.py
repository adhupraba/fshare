from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User
from cryptography.hazmat.primitives import serialization


class UserRegisterSerializer(serializers.ModelSerializer):
    master_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["name", "email", "password", "master_password", "role"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        name = validated_data["name"]
        email = validated_data["email"].lower()
        role = validated_data.get("role", "user")
        password = validated_data["password"]
        master_password = validated_data["master_password"]

        user = User(name=name, email=email, role=role)
        user.password = make_password(password)

        from .utils import generate_rsa_key_pair, encrypt_private_key

        private_key, public_key = generate_rsa_key_pair()
        enc_priv_key = encrypt_private_key(private_key, master_password)
        mp_hash = make_password(master_password)

        user.master_password_hash = mp_hash
        user.encrypted_private_key = enc_priv_key
        user.public_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )

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
