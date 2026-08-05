from django.urls import path

from .views import (
    ConversationListAPIView,
    ConversationMessagesAPIView,
    SendMessageAPIView,
    CreateConversationAPIView,
    DeleteConversationAPIView,
    UpdateMessageAPIView,
    DeleteMessageAPIView,
)

app_name = "chat"

urlpatterns = [
    path(
            "conversations/<int:conversation_id>/delete/",
            DeleteConversationAPIView.as_view(),
            name="delete-conversation",
        ),
    path(
        "conversations/",
        ConversationListAPIView.as_view(),
        name="conversation-list",
    ),
    path(
        "messages/send/",
        SendMessageAPIView.as_view(),
        name="send-message",
    ),

    path(
        "conversations/create/",
        CreateConversationAPIView.as_view(),
        name="conversation-create",
    ),

    path(
        "messages/<int:conversation_id>/",
        ConversationMessagesAPIView.as_view(),
        name="conversation-messages",
    ),

    path(
        "messages/<int:message_id>/update/",
        UpdateMessageAPIView.as_view(),
        name="update-message",
    ),

    path(
        "messages/<int:message_id>/delete/",
        DeleteMessageAPIView.as_view(),
        name="delete-message",
    ),

]