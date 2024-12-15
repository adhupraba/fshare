from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, username, password, name, **extra_fields):
        if not email:
            raise ValueError("User must have an email address")

        if not username:
            raise ValueError("User must have a username")

        if not name:
            raise ValueError("User must have a name")

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, email, username, password=None, name=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(email, username, password, name, **extra_fields)

    def create_superuser(self, email, username, password, name, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, username, password, name, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
        ("guest", "Guest"),
    ]

    first_name = None
    last_name = None

    # Personal Details
    name = models.CharField(max_length=150)
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

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "name"]

    objects = UserManager()

    def is_admin(self):
        return self.role == "admin"

    def is_regular_user(self):
        return self.role == "user"

    def is_guest(self):
        return self.role == "guest"
