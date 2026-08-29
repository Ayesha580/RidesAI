from django.urls import path

from .views import (
    HerryToolView,
    HerryChatView,
    HerryConversationView,
)


urlpatterns = [

    path(
        "tool/",
        HerryToolView.as_view(),
        name="herry-tool",
    ),

    path(
        "chat/",
        HerryChatView.as_view(),
        name="herry-chat",
    ),

    path(
        "conversation/<int:conversation_id>/",
        HerryConversationView.as_view(),
        name="herry-conversation",
    ),
]