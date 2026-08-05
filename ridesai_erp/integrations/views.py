from datetime import timedelta
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponseRedirect
from django.utils import timezone

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .google import get_google_flow
from .gmail import send_email
from .models import Mailbox, OAuthState
from .serializers import MailboxSerializer
from .services import get_mailbox

import secrets


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def google_login(request):

    flow = get_google_flow()

    state = secrets.token_urlsafe(32)

    OAuthState.objects.create(
        state=state,
        company=request.user.company,
    )

    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    print("Authorization URL:", authorization_url)  

    return Response(
        {
            "authorization_url": authorization_url
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def google_callback(request):

    state = request.GET.get("state")
    code = request.GET.get("code")

    if not state or not code:
        return Response(
            {"detail": "Invalid callback."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    oauth_state = OAuthState.objects.filter(state=state).first()

    if not oauth_state:
        return Response(
            {"detail": "Invalid state."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    flow = get_google_flow()

    flow.fetch_token(code=code)

    credentials = flow.credentials

    info = id_token.verify_oauth2_token(
        credentials.id_token,
        google_requests.Request(),
        clock_skew_in_seconds=10,
    )

    email = info["email"]

    Mailbox.objects.update_or_create(
        company=oauth_state.company,
        defaults={
            "provider": "gmail",
            "email": email,
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "expires_at": credentials.expiry,
            "connected": True,
        },
    )

    oauth_state.delete()

    return HttpResponseRedirect(
        "https://ridesai.cloud/owner/settings/mailbox?connected=true"
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mailbox_status(request):

    mailbox = Mailbox.objects.filter(
        company=request.user.company
    ).first()

    if not mailbox:
        return Response(
            {
                "connected": False
            }
        )

    return Response(
        MailboxSerializer(mailbox).data
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def disconnect_mailbox(request):

    mailbox = Mailbox.objects.filter(
        company=request.user.company
    ).first()

    if mailbox:

        mailbox.delete()

    return Response(
        {
            "message": "Mailbox disconnected."
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_test_email(request):

    mailbox = get_mailbox(
        request.user.company
    )

    to_email = request.data["email"]

    send_email(
        mailbox=mailbox,
        to_email=to_email,
        subject="Rides AI Test",
        body="Mailbox connected successfully.",
    )

    return Response(
        {
            "message": "Email sent."
        }
    )