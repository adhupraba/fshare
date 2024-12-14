from django.urls import path
from .views import RegisterView, MFAConfirmView, LoginView, GetUserView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = "auth_app"

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("mfa/confirm", MFAConfirmView.as_view(), name="mfa_confirm"),
    path("login", LoginView.as_view(), name="login"),
    path("get-user", GetUserView.as_view(), name="get_user"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
]
