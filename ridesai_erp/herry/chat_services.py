from .models import HerryConversation, HerryMessage


def get_or_create_conversation(user, conversation_id=None):
    """
    Get an existing Herry conversation for the current user/company.
    If conversation_id is not provided or not found, create a new one.
    """

    if conversation_id:
        conversation = HerryConversation.objects.filter(
            id=conversation_id,
            user=user,
            company=user.company,
        ).first()

        if conversation:
            return conversation

    return HerryConversation.objects.create(
        user=user,
        company=user.company,
    )


def save_user_message(conversation, message):
    """
    Save user's message.
    """

    return HerryMessage.objects.create(
        conversation=conversation,
        role=HerryMessage.ROLE_USER,
        message=message,
    )


def save_herry_message(conversation, message):
    """
    Save Herry's response.
    """

    return HerryMessage.objects.create(
        conversation=conversation,
        role=HerryMessage.ROLE_ASSISTANT,
        message=message,
    )


def get_conversation_history(conversation):
    """
    Get all previous messages from this conversation.
    """

    messages = HerryMessage.objects.filter(
        conversation=conversation
    ).order_by("created_at")

    return [
        {
            "role": message.role,
            "message": message.message,
        }
        for message in messages
    ]