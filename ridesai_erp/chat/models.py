from django.conf import settings
from django.db import models

from companies.models import Company
from hr.models import Team

class Conversation(models.Model):
    GENERAL = "general"
    MANAGEMENT = "management"
    TEAM = "team"
    ANNOUNCEMENT = "announcement"
    TYPE_CHOICES = [
        (GENERAL, "General"),
        (MANAGEMENT, "Management"),
        (TEAM, "Team"),
        (ANNOUNCEMENT, "Announcement"),
    ]
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="chat_conversations"
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chat_conversations"
    )
    name = models.CharField(
        max_length=150
    )
    conversation_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_conversations"
    )
    is_active = models.BooleanField(
        default=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )
    class Meta:
        ordering = ["name"]
        unique_together = (
            "company",
            "conversation_type",
            "team",
        )
    def __str__(self):
        return self.name

class ConversationMember(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_memberships"
    )
    is_admin = models.BooleanField(
        default=False
    )
    is_muted = models.BooleanField(
        default=False
    )
    joined_at = models.DateTimeField(
        auto_now_add=True
    )
    class Meta:
        unique_together = (
            "conversation",
            "user",
        )
    def __str__(self):
        return f"{self.user} - {self.conversation}"

class Message(models.Model):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    VOICE = "voice"
    MESSAGE_TYPES = [
        (TEXT, "Text"),
        (IMAGE, "Image"),
        (FILE, "File"),
        (VOICE, "Voice"),
    ]
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages"
    )
    message = models.TextField(
        blank=True
    )
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default=TEXT
    )
    reply_to = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="replies"
    )
    edited = models.BooleanField(
        default=False
    )
    deleted = models.BooleanField(
        default=False
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )
    class Meta:
        ordering = [
            "created_at"
        ]
    def __str__(self):
        return f"{self.sender} ({self.id})"

class MessageAttachment(models.Model):
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="attachments"
    )
    file = models.FileField(
        upload_to="chat/"
    )
    original_name = models.CharField(
        max_length=255
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

class MessageRead(models.Model):
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reads"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    read_at = models.DateTimeField(
        auto_now_add=True
    )
    class Meta:
        unique_together = (
            "message",
            "user",
        )
class MessageReaction(models.Model):
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="reactions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    emoji = models.CharField(
        max_length=20
    )
    class Meta:
        unique_together = (
            "message",
            "user",
            "emoji",
        )

