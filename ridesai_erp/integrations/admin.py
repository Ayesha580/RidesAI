from django.contrib import admin

from .models import Mailbox, OAuthState


@admin.register(Mailbox)
class MailboxAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "email",
        "provider",
        "connected",
        "expires_at",
    )

    search_fields = (
        "email",
        "company__name",
    )


@admin.register(OAuthState)
class OAuthStateAdmin(admin.ModelAdmin):
    list_display = (
        "company",
        "state",
        "created_at",
    )