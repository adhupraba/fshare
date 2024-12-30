from django.contrib import admin
from django.urls import path, include

from .views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("auth_app.urls")),
    path("api/files/", include("file_app.urls")),
    path("api/health/", HealthCheckView.as_view(), name="health_check"),
]
