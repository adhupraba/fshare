from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("user", "User"),
        ("guest", "Guest"),
    )

    first_name = None
    last_name = None
    username = None

    USERNAME_FIELD = None
    REQUIRED_FIELDS = ["name", "email"]

    # Personal Details
    name = models.CharField("name", max_length=150, blank=False)
    email = models.EmailField(
        unique=True,
        error_messages={
            "unique": "A user with that email already exists.",
        },
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    # Encryption fields
    master_password_hash = models.CharField(max_length=255, blank=True, null=True)
    encrypted_private_key = models.BinaryField(null=True, blank=True)
    public_key = models.BinaryField(null=True, blank=True)

    # MFA fields
    mfa_secret = models.CharField(max_length=64, blank=True, null=True)
    mfa_enabled = models.BooleanField(default=False)

    def is_admin(self):
        return self.role == "admin"

    def is_regular_user(self):
        return self.role == "user"

    def is_guest(self):
        return self.role == "guest"
