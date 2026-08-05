import base64

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from google.oauth2.credentials import Credentials

from googleapiclient.discovery import build


def gmail_service(mailbox):

    credentials = Credentials(
        token=mailbox.access_token,
        refresh_token=mailbox.refresh_token,
        token_uri=mailbox.token_uri,
    )

    return build(
        "gmail",
        "v1",
        credentials=credentials,
    )


def send_email(mailbox, to_email, subject, body):
    """Plain text email — mailbox ke Gmail account se jayega."""

    service = gmail_service(mailbox)

    message = MIMEText(body)

    message["to"] = to_email
    message["from"] = mailbox.email
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    service.users().messages().send(
        userId="me",
        body={
            "raw": raw
        }
    ).execute()


def send_html_email(mailbox, to_email, subject, text_body, html_body):
    """HTML + plain text fallback email — mailbox ke Gmail account se jayega."""

    service = gmail_service(mailbox)

    message = MIMEMultipart("alternative")

    message["to"] = to_email
    message["from"] = mailbox.email
    message["subject"] = subject

    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

    raw = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    service.users().messages().send(
        userId="me",
        body={
            "raw": raw
        }
    ).execute()