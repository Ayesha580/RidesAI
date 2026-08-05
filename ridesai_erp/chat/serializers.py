from rest_framework import serializers

from accounts.models import User
from .models import (
    Conversation,
    ConversationMember,
    Message,
    MessageAttachment,
    MessageReaction,
    MessageRead,
)
from accounts.models import User


class CreateConversationSerializer(serializers.Serializer):

    members = serializers.ListField(
        child=serializers.IntegerField()
    )

    name = serializers.CharField(
        required=False,
        allow_blank=True
    )

    conversation_type = serializers.CharField(
        required=False,
        default="direct"
    )

    def create(self, validated_data):

        request = self.context["request"]

        member_ids = validated_data.pop("members")

        conversation = Conversation.objects.create(
            company=request.user.company,
            name=validated_data.get("name", ""),
            conversation_type=validated_data.get("conversation_type", "direct"),
        )

        # creator add
        ConversationMember.objects.create(
            conversation=conversation,
            user=request.user
        )

        users = User.objects.filter(
            id__in=member_ids,
            company=request.user.company
        )

        for user in users:
            if user != request.user:
                ConversationMember.objects.create(
                    conversation=conversation,
                    user=user
                )

        return conversation
# ----------------------------
# User
# ----------------------------

class ChatUserSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role",
        )

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# ----------------------------
# Attachments
# ----------------------------

class MessageAttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = MessageAttachment
        fields = (
            "id",
            "file",
            "original_name",
            "uploaded_at",
        )


# ----------------------------
# Reactions
# ----------------------------

class MessageReactionSerializer(serializers.ModelSerializer):

    user = ChatUserSerializer(read_only=True)

    class Meta:
        model = MessageReaction
        fields = (
            "id",
            "emoji",
            "user",
        )


# ----------------------------
# Reads
# ----------------------------

class MessageReadSerializer(serializers.ModelSerializer):

    user = ChatUserSerializer(read_only=True)

    class Meta:
        model = MessageRead
        fields = (
            "id",
            "user",
            "read_at",
        )


# ----------------------------
# Message
# ----------------------------

class MessageSerializer(serializers.ModelSerializer):

    sender = ChatUserSerializer(read_only=True)

    attachments = MessageAttachmentSerializer(
        many=True,
        read_only=True
    )

    reactions = MessageReactionSerializer(
        many=True,
        read_only=True
    )

    reads = MessageReadSerializer(
        many=True,
        read_only=True
    )

    reply_message = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "conversation",
            "sender",
            "message",
            "message_type",
            "reply_to",
            "reply_message",
            "attachments",
            "reactions",
            "reads",
            "edited",
            "deleted",
            "created_at",
            "updated_at",
        )

    def get_reply_message(self, obj):

        if not obj.reply_to:
            return None

        return {
            "id": obj.reply_to.id,
            "message": obj.reply_to.message,
            "sender": obj.reply_to.sender.get_full_name()
            or obj.reply_to.sender.username,
        }


# ----------------------------
# Conversation Members
# ----------------------------

class ConversationMemberSerializer(serializers.ModelSerializer):

    user = ChatUserSerializer(read_only=True)

    class Meta:
        model = ConversationMember
        fields = (
            "id",
            "user",
            "is_admin",
            "is_muted",
            "joined_at",
        )


# ----------------------------
# Conversation List
# ----------------------------

class ConversationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    members = ConversationMemberSerializer(
        many=True,
        read_only=True
    )

    total_members = serializers.SerializerMethodField()

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "name",
            "conversation_type",
            "team",
            "members",
            "total_members",
            "last_message",
            "created_at",
        )

    def get_total_members(self, obj):
        return obj.members.count()
    def get_name(self, obj):
        request = self.context.get("request")
        if not request:
            return obj.name
        if obj.conversation_type == "group":
            return obj.name
        other_member = (
            obj.members.exclude(user=request.user)
            .select_related("user")
            .first()
        )
        if other_member:
            return (
                    other_member.user.get_full_name()
                    or other_member.user.username
            )

        return request.user.get_full_name() or request.user.username

    def get_last_message(self, obj):

        message = obj.messages.order_by("-created_at").first()

        if not message:
            return None

        return {
            "id": message.id,
            "sender": message.sender.get_full_name()
            or message.sender.username,
            "message": message.message,
            "message_type": message.message_type,
            "created_at": message.created_at,
        }


# ----------------------------
# Send Message
# ----------------------------

class SendMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = (
            "conversation",
            "message",
            "message_type",
            "reply_to",
        )