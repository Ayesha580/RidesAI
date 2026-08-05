from django.db import models
from django.utils import timezone
from companies.models import Company


class Mailbox(models.Model):
    PROVIDERS = (
        ("gmail", "Google"),
        ("outlook", "Microsoft"),
    )

    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name="mailbox",
    )

    provider = models.CharField(
        max_length=20,
        choices=PROVIDERS,
        default="gmail",
    )

    email = models.EmailField()

    access_token = models.TextField()

    refresh_token = models.TextField()

    token_uri = models.URLField()

    expires_at = models.DateTimeField()

    connected = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    @property
    def expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"{self.company.name} ({self.email})"


class OAuthState(models.Model):
    state = models.CharField(
        max_length=255,
        unique=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.state