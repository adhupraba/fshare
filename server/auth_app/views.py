from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserRegisterSerializer, LoginSerializer, UserDetailSerializer
from .utils import (
    generate_mfa_secret,
    verify_totp,
    generate_totp_uri,
    generate_qr_code_image_uri,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "User registered successfully."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MFARegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.mfa_enabled:
            return Response(
                {"message": "MFA already enabled."}, status=status.HTTP_400_BAD_REQUEST
            )

        secret = generate_mfa_secret()
        user.mfa_secret = secret
        user.save()

        totp_uri = generate_totp_uri(secret, user.email)
        qr_code_image = generate_qr_code_image_uri(totp_uri)

        return Response({"qr_code_image": qr_code_image}, status=status.HTTP_200_OK)


class ConfirmMFAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        totp_code = request.data.get("totp_code")
        user = request.user

        if not user.mfa_secret:
            return Response(
                {"message": "No MFA secret. Setup MFA first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verify_totp(totp_code, user.mfa_secret):
            user.mfa_enabled = True
            user.save()

            return Response(
                {"message": "MFA enabled successfully."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": "Invalid TOTP code."}, status=status.HTTP_400_BAD_REQUEST
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].lower()
        password = serializer.validated_data["password"]
        totp_code = serializer.validated_data.get("totp_code")

        user = User.objects.filter(email=email).first()

        if user is None or not user.check_password(password):
            return Response(
                {"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )

        # If MFA enabled, verify TOTP
        if user.mfa_enabled:
            if not totp_code:
                return Response(
                    {"message": "MFA code required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not verify_totp(totp_code, user.mfa_secret):
                return Response(
                    {"message": "Invalid MFA code."}, status=status.HTTP_400_BAD_REQUEST
                )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class GetUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=200)
