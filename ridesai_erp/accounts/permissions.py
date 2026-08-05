from rest_framework.permissions import BasePermission
from .models import User


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.ROLE_OWNER
        )


class IsHR(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.ROLE_HR
        )


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.ROLE_EMPLOYEE
        )


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.ROLE_MANAGER
        )


class IsAccountant(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == User.ROLE_ACCOUNTANT
        )

class IsOwnerOrHROrManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in (
                User.ROLE_OWNER,
                User.ROLE_HR,
                User.ROLE_MANAGER,
            )
        )