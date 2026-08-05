from django.utils import timezone

from google.auth.transport.requests import Request

from google.oauth2.credentials import Credentials

from django.conf import settings

from .models import Mailbox


def refresh_access_token(mailbox):

    credentials = Credentials(
        token=mailbox.access_token,
        refresh_token=mailbox.refresh_token,
        token_uri=mailbox.token_uri,
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    )

    credentials.refresh(Request())

    mailbox.access_token = credentials.token

    mailbox.expires_at = credentials.expiry

    mailbox.save(
        update_fields=[
            "access_token",
            "expires_at",
        ]
    )

    return mailbox


def get_mailbox(company):

    mailbox = Mailbox.objects.get(
        company=company,
        connected=True,
    )

    if mailbox.expires_at <= timezone.now():

        mailbox = refresh_access_token(mailbox)

    return mailbox