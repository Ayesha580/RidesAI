from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

from rest_framework_simplejwt.token_blacklist.models import OutstandingToken


class UserAdmin(BaseUserAdmin):
    """
    Custom UserAdmin — the stock UserAdmin only knows about the default
    auth fields. Ours adds role/company/phone/must_change_password so
    Super Admin can actually see and manage them from /admin/.
    """

    list_display = (
        'username',
        'email',
        'role',
        'company',
        'is_active',
        'must_change_password'
    )

    list_filter = (
        'role',
        'is_active',
        'company'
    )

    search_fields = (
        'username',
        'email',
        'first_name',
        'last_name'
    )

    fieldsets = BaseUserAdmin.fieldsets + (
        ('ERP Info', {
            'fields': (
                'role',
                'company',
                'phone',
                'must_change_password'
            )
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('ERP Info', {
            'fields': (
                'role',
                'company',
                'phone'
            )
        }),
    )


    def delete_model(self, request, obj):
        """
        Delete JWT tokens before deleting user
        """
        OutstandingToken.objects.filter(user=obj).delete()
        obj.delete()


admin.site.register(User, UserAdmin)