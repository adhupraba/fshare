import os

from django.apps import AppConfig
from django.core.exceptions import ImproperlyConfigured


class AuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_app"

    def ready(self):
        """
        Validate environment variables when the app starts.
        """
        required_env_vars = [
            "SECRET_KEY",
            "SERVER_FILE_ENCRYPTION_KEY",
            "MFA_JWT_SECRET_KEY",
            "AUTH_JWT_SECRET_KEY",
        ]

        missing_vars = [var for var in required_env_vars if not os.getenv(var)]

        if missing_vars:
            raise ImproperlyConfigured(
                f"The following environment variables are missing: {', '.join(missing_vars)}"
            )
