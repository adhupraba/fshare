from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


# Register your models here.
@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Define admin model for custom User model with no email field."""

    fieldsets = (
        (
            _("Personal info"),
            {
                "fields": (
                    "name",
                    "email",
                    "username",
                    "role",
                    "mfa_enabled",
                    "mfa_secret",
                    "encrypted_private_key",
                    "public_key",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email",),
            },
        ),
    )
    list_display = ("email", "name", "is_staff")
    search_fields = ("email", "name")
    ordering = ("email", "name")
