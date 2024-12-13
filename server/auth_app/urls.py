from django.urls import path
from .views import RegisterView, MFARegisterView, ConfirmMFAView, LoginView, GetUserView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = "auth_app"

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("mfa/register", MFARegisterView.as_view(), name="mfa_register"),
    path("mfa/confirm", ConfirmMFAView.as_view(), name="mfa_confirm"),
    path("login", LoginView.as_view(), name="login"),
    path("get-user", GetUserView.as_view(), name="get_user"),
    path("token/refresh", TokenRefreshView.as_view(), name="refresh_token"),
]
