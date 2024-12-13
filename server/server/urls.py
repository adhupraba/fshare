from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("auth_app.urls")),
    path("files/", include("file_app.urls")),
]
