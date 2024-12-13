from django.urls import path
from .views import FileUploadView, SharedFileAccessView

urlpatterns = [
    path("upload", FileUploadView.as_view(), name="file-upload"),
    path(
        "shared/<str:token>", SharedFileAccessView.as_view(), name="shared-file-access"
    ),
]
