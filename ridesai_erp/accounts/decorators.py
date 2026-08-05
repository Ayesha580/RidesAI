from functools import wraps

from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

from .models import User


def role_required(*roles):
    """
    Restrict a view to specific roles. Super Admin always passes,
    since (per spec) Super Admin only manages the platform, not any
    single company's data, but should never be blocked by a company
    role check.
    """
    def decorator(view_func):
        @login_required
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if request.user.role != User.ROLE_SUPERADMIN and request.user.role not in roles:
                raise PermissionDenied("You do not have permission.")
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator