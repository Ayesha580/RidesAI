from django.db.models.signals import post_save
from django.dispatch import receiver
from companies.models import Company
from accounts.models import User
from .models import Conversation, ConversationMember
from hr.models import Team


@receiver(post_save, sender=Team)
def create_team_conversation(sender, instance, created, **kwargs):

    if not created:
        return

    Conversation.objects.get_or_create(
        company=instance.company,
        team=instance,
        conversation_type=Conversation.TEAM,
        defaults={
            "name": instance.name,
        },
    )



@receiver(post_save, sender=User)
def join_team_channel(sender, instance, created, **kwargs):

    if not created:
        return

    if not getattr(instance, "company", None):
        return

    if not hasattr(instance, "team"):
        return

    if not instance.team:
        return

    conversation = Conversation.objects.filter(
        company=instance.company,
        team=instance.team,
        conversation_type=Conversation.TEAM,
    ).first()

    if conversation:
        ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=instance,
        )

@receiver(post_save, sender=Company)
def create_default_conversations(sender, instance, created, **kwargs):

    if not created:
        return

    defaults = [
        ("General", Conversation.GENERAL),
        ("Management", Conversation.MANAGEMENT),
        ("Announcements", Conversation.ANNOUNCEMENT),
    ]

    for name, conv_type in defaults:
        Conversation.objects.get_or_create(
            company=instance,
            conversation_type=conv_type,
            team=None,
            defaults={
                "name": name,
            },
        )


# -----------------------------
# Add new user to conversations
# -----------------------------
@receiver(post_save, sender=User)
def add_user_to_default_channels(sender, instance, created, **kwargs):

    if not created:
        return

    if not instance.company:
        return

    company = instance.company

    conversations = Conversation.objects.filter(
        company=company,
        conversation_type__in=[
            Conversation.GENERAL,
            Conversation.ANNOUNCEMENT,
        ],
    )

    for conversation in conversations:
        ConversationMember.objects.get_or_create(
            conversation=conversation,
            user=instance,
            defaults={
                "is_admin": instance.role == "owner",
            },
        )

    # Management channel
    if instance.role in ["owner", "hr", "manager"]:

        management = Conversation.objects.filter(
            company=company,
            conversation_type=Conversation.MANAGEMENT,
        ).first()

        if management:
            ConversationMember.objects.get_or_create(
                conversation=management,
                user=instance,
                defaults={
                    "is_admin": instance.role == "owner",
                },
            )