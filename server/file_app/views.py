import os, uuid, base64, jwt
from django.conf import settings
from django.utils import timezone
from django.http import HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from auth_app.permissions import IsAdminOrRegularUser
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
    permission_classes = [IsAuthenticated, IsAdminOrRegularUser]

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data["file"]
        file_symmetric_key_b64 = serializer.validated_data["file_symmetric_key"]
        recipients_data = serializer.validated_data["recipients"]
        global_can_view = serializer.validated_data["can_view"]
        global_can_download = serializer.validated_data["can_download"]

        original_name = uploaded_file.name
        file_content = uploaded_file.read()

        # Server-side encryption
        nonce, encrypted_data = encrypt_data(file_content)
        combined_data = nonce + encrypted_data

        unique_filename = f"{uuid.uuid4().hex}.enc"
        file_path = os.path.join(settings.MEDIA_ROOT, unique_filename)

        with open(file_path, "wb") as f:
            f.write(combined_data)

        f_obj = File.objects.create(
            owner=request.user,
            filename=original_name,
            encrypted_file_path=unique_filename,
        )

        # Decode file symmetric key
        file_symmetric_key = base64.b64decode(file_symmetric_key_b64)

        valid_recipients_count = 0
        # For all recipients
        for rcp in recipients_data:
            email = rcp.get("email")
            rcp_can_view = rcp.get("can_view", global_can_view)
            rcp_can_download = rcp.get("can_download", global_can_download)

            if rcp_can_download:
                rcp_can_view = True

            try:
                recipient = User.objects.get(email=email)
            except User.DoesNotExist:
                continue
            if not recipient.public_key:
                continue

            enc_key_for_recipient = encrypt_with_public_key(
                recipient.public_key, file_symmetric_key
            )
            FileShare.objects.create(
                file=f_obj,
                recipient=recipient,
                encrypted_file_key=enc_key_for_recipient,
                can_view=rcp_can_view,
                can_download=rcp_can_download,
            )
            valid_recipients_count += 1

        if valid_recipients_count == 0:
            # No valid recipients, share with owner
            if request.user.public_key:
                owner_enc_key = encrypt_with_public_key(
                    request.user.public_key, file_symmetric_key
                )
                FileShare.objects.create(
                    file=f_obj,
                    recipient=request.user,
                    encrypted_file_key=owner_enc_key,
                    can_view=global_can_view,
                    can_download=global_can_download,
                )
            else:
                # Cleanup if no public key for owner
                f_obj.delete()
                return Response(
                    {"message": "Owner does not have a public key, cannot share."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Generate a single share link for this file
        token = generate_share_jwt(f_obj.id)
        share_link = f"{request.scheme}://{request.get_host()}/files/shared/{token}"

        return Response(
            {
                "message": "File uploaded and shares created successfully.",
                "file_id": f_obj.id,
                "filename": f_obj.filename,
                "share_link": share_link,
            },
            status=status.HTTP_201_CREATED,
        )


class SharedFileAccessView(APIView):
    # Authenticated users only
    permission_classes = [IsAuthenticated]

    def get(self, request, token):
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
            share = FileShare.objects.get(file__id=file_id, recipient=request.user)
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
                {"message": "File missing on server."}, status=status.HTTP_404_NOT_FOUND
            )

        with open(file_path, "rb") as fd:
            combined_data = fd.read()

        b64_enc_key = base64.b64encode(share.encrypted_file_key).decode("utf-8")
        permissions_data = {
            "can_view": share.can_view,
            "can_download": share.can_download,
            "encrypted_file_key": b64_enc_key,
        }

        nonce = combined_data[:12]
        encrypted_data = combined_data[12:]
        decrypted_data = decrypt_data(nonce, encrypted_data)

        import json

        json_part = json.dumps(permissions_data, ensure_ascii=False)
        # boundary for multipart response separating json and file data in the response
        boundary = "----FILESHAREBOUNDARY"

        # multipart response data
        multipart_body = (
            f"--{boundary}\r\n"
            "Content-Type: application/json; charset=utf-8\r\n"
            "\r\n"
            f"{json_part}\r\n"
            f"--{boundary}\r\n"
            "Content-Type: application/octet-stream\r\n"
            f'Content-Disposition: attachment; filename="{f_obj.filename}"\r\n'
            "\r\n"
        )
        multipart_body = multipart_body.encode("utf-8") + decrypted_data + b"\r\n"
        multipart_body += f"--{boundary}--\r\n".encode("utf-8")

        response = HttpResponse(
            multipart_body,
            content_type=f"multipart/mixed; boundary={boundary}",
        )
        response.status_code = status.HTTP_200_OK

        return response
