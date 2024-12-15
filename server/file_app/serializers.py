import base64, re, json
from rest_framework import serializers
from django.conf import settings
from auth_app.validators import validate_email


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    encryption_key_b64 = serializers.CharField(required=True)
    file_metadata = serializers.CharField(required=True)
    recipients = serializers.CharField(required=False)

    def validate_file(self, value):
        max_file_size_in_bytes = settings.FILE_SIZE_LIMIT_IN_MB * 1024 * 1024

        if value.size > max_file_size_in_bytes:
            raise serializers.ValidationError(
                f"File size exceeds the maximum limit of {settings.FILE_SIZE_LIMIT_IN_MB} MB."
            )

        # uploaded file is client side ecrypted and should have the extension `.enc`
        if not value.name.lower().endswith((".enc")):
            raise serializers.ValidationError("Invalid encrypted file.")

        return value

    def validate_file_metadata(self, value):
        try:
            metadata = json.loads(value)
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON format in file_metadata.")

        required_keys = {"name", "mimetype", "size"}

        if not all(key in metadata for key in required_keys):
            raise serializers.ValidationError(
                f"file_metadata must contain {required_keys}."
            )

        # Additional validations for file metadata
        if not isinstance(metadata["name"], str) or not metadata["name"]:
            raise serializers.ValidationError(
                "Invalid or missing 'name' in file_metadata."
            )

        if not isinstance(metadata["mimetype"], str) or not metadata["mimetype"]:
            raise serializers.ValidationError(
                "Invalid or missing 'mimetype' in file_metadata."
            )

        allowed_mimetype_regex = r"^(image/.+|audio/.+|video/.+|application/pdf)$"

        if not re.match(allowed_mimetype_regex, metadata["mimetype"]):
            raise serializers.ValidationError(
                "Invalid mimetype. Only image, audio, video and pdf files are allowed."
            )

        max_file_size_in_bytes = settings.FILE_SIZE_LIMIT_IN_MB * 1024 * 1024

        if (
            not isinstance(metadata["size"], int)
            or metadata["size"] < 0
            or metadata["size"] > max_file_size_in_bytes
        ):
            raise serializers.ValidationError(
                "Invalid or missing 'size' in file_metadata."
            )

        return metadata

    def validate_encryption_key_b64(self, value):
        try:
            return base64.b64decode(value)
        except Exception:
            raise serializers.ValidationError("Invalid base64 for file_symmetric_key.")

    def validate_recipients(self, value):
        try:
            recipients = json.loads(value)
        except json.JSONDecodeError:
            raise serializers.ValidationError("Invalid JSON format in recipients.")

        if not isinstance(recipients, list):
            raise serializers.ValidationError("recipients must be a list of objects.")

        for recipient in recipients:
            if not isinstance(recipient, dict):
                raise serializers.ValidationError(
                    "Each recipient must be a dictionary."
                )

            required_keys = {"email", "can_view", "can_download"}
            if not all(key in recipient for key in required_keys):
                raise serializers.ValidationError(
                    f"Each recipient must contain {required_keys}."
                )

            # Validate email
            email = recipient.get("email")
            validate_email(email)  # automatically raises exception

            # Validate boolean fields
            for key in ["can_view", "can_download"]:
                if not isinstance(recipient[key], bool):
                    raise serializers.ValidationError(f"'{key}' must be a boolean.")

        return recipients
