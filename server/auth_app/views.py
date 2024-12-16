import jwt
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    UserRegisterSerializer,
    LoginSerializer,
    GetEncPrivateKeySerializer,
)
from .permissions import IsActive
from .utils import (
    decode_mfa_temp_token,
    generate_mfa_temp_token,
    verify_totp,
    generate_totp_uri,
    generate_qr_code_image_uri,
    generate_mfa_secret,
)


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            mfa_temp_token, token_exp_at = generate_mfa_temp_token(user.id)
            totp_uri = generate_totp_uri(user.mfa_secret, user.email)
            qr_code_image = generate_qr_code_image_uri(totp_uri)

            return Response(
                {
                    "message": "User registered successfully.",
                    "mfa_temp_token": mfa_temp_token,
                    "totp_qr": qr_code_image,
                    "token_exp_at": token_exp_at,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]

        if not user.mfa_secret:
            user.mfa_secret = generate_mfa_secret()
            user.save()

        if user.mfa_enabled:
            mfa_temp_token, token_exp_at = generate_mfa_temp_token(user.id)

            return Response(
                {
                    "message": "MFA required. Please provide TOTP code with the temporary token.",
                    "action": "mfa_required",
                    "mfa_temp_token": mfa_temp_token,
                    "token_exp_at": token_exp_at,
                },
                status=status.HTTP_200_OK,
            )
        else:
            mfa_temp_token, token_exp_at = generate_mfa_temp_token(user.id)
            totp_uri = generate_totp_uri(user.mfa_secret, user.email)
            qr_code_image = generate_qr_code_image_uri(totp_uri)

            return Response(
                {
                    "message": "MFA setup required. Please provide TOTP code with the temporary token.",
                    "action": "mfa_setup",
                    "mfa_temp_token": mfa_temp_token,
                    "totp_qr": qr_code_image,
                    "token_exp_at": token_exp_at,
                },
                status=status.HTTP_200_OK,
            )


"""
after register or login, this api will be called to authenticate the user
if mfa is not enabled, this api updated the user record that mfa has been enabled
then normal access and refresh tokens are issued
"""


class MFAConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        mfa_temp_token = request.data.get("mfa_temp_token")
        totp_code = request.data.get("totp_code")

        if not mfa_temp_token or not totp_code:
            return Response(
                {"message": "Missing mfa_temp_token or totp_code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = decode_mfa_temp_token(mfa_temp_token)
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
            return Response(
                {"message": "Invalid or expired token."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = payload.get("user_id")
        user = User.objects.filter(id=user_id).first()

        if not user:
            return Response(
                {"message": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not verify_totp(totp_code, user.mfa_secret):
            return Response(
                {"message": "Invalid TOTP code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.mfa_enabled:
            user.mfa_enabled = True
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "You are now logged in.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": get_formatted_user(user),
            },
            status=status.HTTP_200_OK,
        )


class GetUserView(APIView):
    permission_classes = [IsActive]

    def get(self, request):
        return Response(
            get_formatted_user(request.user),
            status=status.HTTP_200_OK,
        )


class GetEncPrivateKey(APIView):
    permission_classes = [IsActive]

    def post(self, request):
        serializer = GetEncPrivateKeySerializer(
            data=request.data, context={"user": request.user}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "Master password validated successfully.",
                "enc_private_key": request.user.encrypted_private_key,
            },
            status=status.HTTP_200_OK,
        )


def get_formatted_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }
