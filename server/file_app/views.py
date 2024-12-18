import os, uuid, base64, jwt, json, traceback

from requests_toolbelt.multipart.encoder import MultipartEncoder

from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from auth_app.permissions import IsAdminOrRegularUser, IsActive
from auth_app.models import User
from .models import File, FileShare
from .serializers import FileUploadSerializer
from .utils import (
    encrypt_data,
    decrypt_data,
    encrypt_with_public_key,
    generate_share_jwt,
)


class FileUploadView(APIView):
    permission_classes = [IsAdminOrRegularUser]

    def post(self, request):
        file_path = None

        try:
            serializer = FileUploadSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.user.role == "guest":
                return Response(
                    {"message": "Guest users cannot upload files"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            uploaded_file = serializer.validated_data["file"]
            encryption_key_b64 = serializer.validated_data["encryption_key_b64"]
            file_metadata = serializer.validated_data["file_metadata"]
            recipients_data = serializer.validated_data["recipients"]

            file_content = uploaded_file.read()

            # Server-side encryption
            nonce, encrypted_data = encrypt_data(file_content)
            combined_data = nonce + encrypted_data

            unique_filename = f"{uuid.uuid4().hex}.enc"
            file_path = os.path.join(settings.MEDIA_ROOT, unique_filename)

            with open(file_path, "wb") as f:
                f.write(combined_data)

            with transaction.atomic():
                f_obj = File.objects.create(
                    owner=request.user,
                    server_enc_file_name=unique_filename,
                    file_metadata=file_metadata,
                )

                expires_at = timezone.now() + timezone.timedelta(minutes=30)

                for rcp in recipients_data:
                    email = rcp.get("email")
                    rcp_can_view = rcp.get("can_view", True)
                    rcp_can_download = rcp.get("can_download", False)

                    if rcp_can_download:
                        rcp_can_view = True

                    try:
                        recipient = User.objects.get(email=email)
                    except User.DoesNotExist:
                        continue

                    if not recipient.public_key:
                        continue

                    enc_key_for_recipient_binary = encrypt_with_public_key(
                        recipient.public_key, encryption_key_b64
                    )
                    enc_key_for_recipient = base64.b64encode(
                        enc_key_for_recipient_binary
                    ).decode("utf-8")

                    FileShare.objects.create(
                        file=f_obj,
                        recipient=recipient,
                        encrypted_file_key=enc_key_for_recipient,
                        can_view=rcp_can_view,
                        can_download=rcp_can_download,
                        expires_at=expires_at,
                    )

                if request.user.public_key:
                    owner_enc_key_binary = encrypt_with_public_key(
                        request.user.public_key, encryption_key_b64
                    )
                    owner_enc_key = base64.b64encode(owner_enc_key_binary).decode(
                        "utf-8"
                    )

                    FileShare.objects.create(
                        file=f_obj,
                        recipient=request.user,
                        encrypted_file_key=owner_enc_key,
                        can_view=True,
                        can_download=True,
                        expires_at=expires_at,
                    )

                # Generate a single share token which can be used by all the recipients
                token, token_exp_at = generate_share_jwt(f_obj.id)

            return Response(
                {
                    "message": "File uploaded and shares created successfully.",
                    "share_token": token,
                    "token_exp_at": token_exp_at,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            traceback.print_exc()

            if (file_path is not None) and (os.path.exists(file_path)):
                os.remove(file_path)

            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SharedFileAccessView(APIView):
    # Authenticated users only
    permission_classes = [IsActive]

    def get(self, request, token):
        try:
            secret_key = os.environ.get("AUTH_JWT_SECRET_KEY")

            try:
                payload = jwt.decode(token, secret_key, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return Response(
                    {"message": "Link expired."}, status=status.HTTP_403_FORBIDDEN
                )
            except jwt.InvalidTokenError:
                return Response(
                    {"message": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST
                )

            file_id = payload.get("file_id")

            # Check if this user is a recipient in FileShare
            try:
                share = FileShare.objects.select_related("file__owner").get(
                    file__id=file_id, recipient=request.user
                )
            except FileShare.DoesNotExist:
                return Response(
                    {"message": "You do not have permission to access this file."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Check expiration
            if share.expires_at < timezone.now():
                return Response(
                    {"message": "Link expired."}, status=status.HTTP_403_FORBIDDEN
                )

            if not share.can_view:
                return Response(
                    {"message": "View not allowed."}, status=status.HTTP_403_FORBIDDEN
                )

            f_obj = share.file
            file_path = f_obj.get_full_path()

            if not os.path.exists(file_path):
                return Response(
                    {"message": "File missing on server."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            with open(file_path, "rb") as fd:
                combined_data = fd.read()

            permissions_data = {
                "can_view": share.can_view,
                "can_download": share.can_download,
                "expires_at": share.expires_at.isoformat(),
                "encrypted_file_key": share.encrypted_file_key,
            }

            metadata = f_obj.file_metadata
            metadata["owner"] = {
                "name": f_obj.owner.name,
                "username": f_obj.owner.username,
            }

            nonce = combined_data[:12]
            encrypted_data = combined_data[12:]
            decrypted_data = decrypt_data(nonce, encrypted_data)

            file_metadata = json.dumps(metadata, ensure_ascii=False)
            share_permission_data = json.dumps(permissions_data, ensure_ascii=False)
            decypted_data_b64 = base64.b64encode(decrypted_data).decode("utf-8")

            multipart_body = MultipartEncoder(
                fields={
                    "permissions": (
                        "permissions.json",
                        share_permission_data,
                        "application/json",
                    ),
                    "metadata": (
                        "metadata.json",
                        file_metadata,
                        "application/json",
                    ),
                    "file": (
                        f_obj.server_enc_file_name,
                        decypted_data_b64,
                        "application/octet-stream",
                    ),
                }
            )

            response = HttpResponse(
                multipart_body.to_string(),
                content_type=multipart_body.content_type,
            )

            response.status_code = status.HTTP_200_OK

            return response
        except Exception as e:
            traceback.print_exc()
            return Response(
                {"message": "Something went wrong.", "stack": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
