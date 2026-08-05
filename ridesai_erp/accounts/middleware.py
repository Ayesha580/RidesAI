from django.shortcuts import redirect
from django.urls import reverse


class ForcePasswordChangeMiddleware:
    """
    Unchanged from your version — this one was already correct.
    Only ever applies to authenticated users, so it doesn't interfere
    with the pending-approval gate in views.login_view().
    """
    EXEMPT_PATHS = ('/change-password/', '/logout/', '/login/')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        if (
            user and user.is_authenticated
            and getattr(user, 'must_change_password', False)
            and not request.path.startswith(self.EXEMPT_PATHS)
            and not request.path.startswith('/static/')
            and not request.path.startswith('/media/')
            and not request.path.startswith('/admin/')
        ):
            return redirect(reverse('force-password-change'))
        return self.get_response(request)