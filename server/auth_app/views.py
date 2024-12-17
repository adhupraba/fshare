import jwt, traceback

from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserRegisterSerializer,
    LoginSerializer,
    GetEncPrivateKeySerializer,
    UserSerializer,
    AdminUpdateUserSerializer,
)
from .permissions import IsActive, IsAdmin
from .utils import (
    decode_mfa_temp_token,
    generate_mfa_temp_token,
    verify_totp,
    generate_totp_uri,
    generate_qr_code_image_uri,
    generate_mfa_secret,
    encrypt_mfa_secret,
    decrypt_mfa_secret,
    get_formatted_user,
)


class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        try:
            serializer = UserRegisterSerializer(data=request.data)

            if serializer.is_valid():
                user = serializer.save()

                mfa_secret = decrypt_mfa_secret(user.mfa_secret)

                mfa_temp_token, token_exp_at = generate_mfa_temp_token(user.id)
                totp_uri = generate_totp_uri(mfa_secret, user.email)
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
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            user = serializer.validated_data["user"]
            mfa_secret = user.mfa_secret
            decrypted_mfa_secret = ""

            if not mfa_secret:
                decrypted_mfa_secret = generate_mfa_secret()
                user.mfa_secret = encrypt_mfa_secret(decrypted_mfa_secret)
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
                decrypted_mfa_secret = decrypt_mfa_secret(user.mfa_secret)
                mfa_temp_token, token_exp_at = generate_mfa_temp_token(user.id)
                totp_uri = generate_totp_uri(decrypted_mfa_secret, user.email)
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
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


"""
after register or login, this api will be called to authenticate the user
if mfa is not enabled, this api updated the user record that mfa has been enabled
then normal access and refresh tokens are issued
"""


class MFAConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        try:
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

            mfa_secret = decrypt_mfa_secret(user.mfa_secret)

            if not verify_totp(totp_code, mfa_secret):
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
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GetUserView(APIView):
    permission_classes = [IsActive]

    def get(self, request):
        return Response(
            {"message": "Ok", "user": get_formatted_user(request.user)},
            status=status.HTTP_200_OK,
        )


class GetEncPrivateKey(APIView):
    permission_classes = [IsActive]

    def post(self, request):
        try:
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
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GetUsers(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        try:
            search = request.query_params.get("q", None)
            offset = int(request.query_params.get("page", "1")) - 1
            limit = 10

            if offset < 0:
                return Response(
                    {"message": "Invalid curr_page value"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            query = Q()

            if search:
                query = (
                    Q(name__icontains=search)
                    | Q(username__icontains=search)
                    | Q(email__icontains=search)
                )

            users = User.objects.filter(query).order_by("date_joined")
            total_count = users.count()
            paginated_users = users[offset : offset + limit]

            serializer = UserSerializer(paginated_users, many=True)

            return Response(
                {
                    "results": serializer.data,
                    "page_info": {
                        "total": total_count,
                        "limit": limit,
                        "offset": offset,
                        "fetched": len(serializer.data),
                    },
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminUpdateUser(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        try:
            serializer = AdminUpdateUserSerializer(
                data=request.data, context={"user": request.user}
            )

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            id = serializer.validated_data["id"]
            role = serializer.validated_data.get("role", None)
            is_active = serializer.validated_data.get("is_active", None)

            user = User.objects.get(id=id)

            if role is not None:
                user.role = role

            if is_active is not None:
                user.is_active = is_active

            user.save()

            return Response(
                {
                    "message": "User updated successfully",
                    "user": get_formatted_user(user),
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
