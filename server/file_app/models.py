import os
from django.db import models
from django.conf import settings
from django.utils import timezone


class File(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files"
    )
    server_enc_file_name = models.CharField(max_length=255)
    file_metadata = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def get_full_path(self):
        return os.path.join(settings.MEDIA_ROOT, self.encrypted_file_path)


class FileShare(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="shares")
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared"
    )
    encrypted_file_key = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=None)
    can_view = models.BooleanField(default=True)
    can_download = models.BooleanField(default=False)
