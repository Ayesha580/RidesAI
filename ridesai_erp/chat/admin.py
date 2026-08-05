from django.contrib import admin

from .models import (
    Conversation,
    ConversationMember,
    Message,
    MessageAttachment,
    MessageReaction,
    MessageRead,
)


class ConversationMemberInline(admin.TabularInline):
    model = ConversationMember
    extra = 0
    autocomplete_fields = ("user",)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "company",
        "conversation_type",
        "team",
        "is_active",
        "created_at",
    )

    list_filter = (
        "company",
        "conversation_type",
        "is_active",
    )

    search_fields = (
        "name",
        "company__name",
    )

    raw_id_fields  = (
        "company",
        "team",
        "created_by",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [ConversationMemberInline]


@admin.register(ConversationMember)
class ConversationMemberAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "user",
        "is_admin",
        "is_muted",
        "joined_at",
    )

    list_filter = (
        "is_admin",
        "is_muted",
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "conversation__name",
    )

    autocomplete_fields = (
        "conversation",
        "user",
    )


class MessageAttachmentInline(admin.TabularInline):
    model = MessageAttachment
    extra = 0


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "conversation",
        "sender",
        "message_type",
        "edited",
        "deleted",
        "created_at",
    )

    list_filter = (
        "message_type",
        "edited",
        "deleted",
    )

    search_fields = (
        "message",
        "sender__username",
    )

    autocomplete_fields = (
        "conversation",
        "sender",
        "reply_to",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [MessageAttachmentInline]


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "message",
        "original_name",
        "uploaded_at",
    )

    autocomplete_fields = (
        "message",
    )


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "message",
        "user",
        "emoji",
    )

    search_fields = (
        "user__username",
    )

    autocomplete_fields = (
        "message",
        "user",
    )


@admin.register(MessageRead)
class MessageReadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "message",
        "user",
        "read_at",
    )

    autocomplete_fields = (
        "message",
        "user",
    )