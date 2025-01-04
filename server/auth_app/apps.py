import os, sys

from django.apps import AppConfig
from django.core.exceptions import ImproperlyConfigured


class AuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_app"

    def ready(self):
        """
        Validate environment variables when the app starts.
        """

        # List of commands to skip environment validation
        skip_validation_commands = {
            "collectstatic",
            "makemigrations",
            "migrate",
            "test",
        }

        # Check if a management command is running
        if len(sys.argv) > 1 and sys.argv[1] in skip_validation_commands:
            return  # Skip validation

        required_env_vars = [
            "ENV",
            "SECRET_KEY",
            "SERVER_FILE_ENCRYPTION_KEY",
            "MFA_JWT_SECRET_KEY",
            "AUTH_JWT_SECRET_KEY",
            "ALLOWED_HOSTS",
            "CORS_ALLOWED_ORIGINS",
        ]

        missing_vars = [var for var in required_env_vars if not os.getenv(var)]

        if missing_vars:
            raise ImproperlyConfigured(
                f"The following environment variables are missing: {', '.join(missing_vars)}"
            )
