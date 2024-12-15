from rest_framework.permissions import BasePermission


class IsActive(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_active and request.user.is_authenticated


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_active
            and request.user.is_authenticated
            and request.user.is_admin()
        )


class IsRegularUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_active
            and request.user.is_authenticated
            and request.user.is_regular_user()
        )


class IsGuest(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_active
            and request.user.is_authenticated
            and request.user.is_guest()
        )


class IsAdminOrRegularUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_active
            and request.user.is_authenticated
            and (request.user.is_admin() or request.user.is_regular_user())
        )
