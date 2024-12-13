import os
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class File(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files"
    )
    filename = models.CharField(max_length=255)
    encrypted_file_path = models.CharField(max_length=512)
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
    expires_at = models.DateTimeField(
        default=lambda: timezone.now() + timedelta(minutes=30)
    )
    can_view = models.BooleanField(default=True)
    can_download = models.BooleanField(default=False)
