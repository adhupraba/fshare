from rest_framework import serializers
import base64


class RecipientSerializer(serializers.Serializer):
    email = serializers.EmailField()
    can_view = serializers.BooleanField(required=False)
    can_download = serializers.BooleanField(required=False)


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(required=True)
    file_symmetric_key = serializers.CharField(required=True)
    can_view = serializers.BooleanField(required=False, default=True)
    can_download = serializers.BooleanField(required=False, default=True)
    recipients = serializers.ListField(
        child=RecipientSerializer(), required=False, allow_empty=True, default=[]
    )

    def validate_file_symmetric_key(self, value):
        try:
            return base64.b64decode(value)
        except Exception:
            raise serializers.ValidationError("Invalid base64 for file_symmetric_key.")
