from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsOwnerOrHROrManager
from .models import (
    Conversation,
    ConversationMember,
    Message,
)
from .serializers import (
    ConversationSerializer,
    MessageSerializer, SendMessageSerializer,
)
from .models import (
    Conversation,
    ConversationMember,
    Message,
)

from .serializers import (
    ConversationSerializer,
    MessageSerializer,
    CreateConversationSerializer,
)
class CreateConversationAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrHROrManager]
    def post(self, request):

        serializer = CreateConversationSerializer(
            data=request.data,
            context={
                "request": request
            }
        )

        serializer.is_valid(
            raise_exception=True
        )

        conversation = serializer.save()

        return Response(
            ConversationSerializer(conversation).data,
            status=status.HTTP_201_CREATED
        )

class ConversationListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            company=request.user.company,
            is_active=True,
            members__user=request.user
        ).distinct()
        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)

class ConversationMessagesAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, conversation_id):
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            company=request.user.company
        )
        if not ConversationMember.objects.filter(
            conversation=conversation,
            user=request.user
        ).exists():
            return Response(
                {
                    "detail": "You are not a member of this conversation."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        messages = conversation.messages.select_related(
            "sender"
        ).prefetch_related(
            "attachments",
            "reactions",
            "reads"
        )
        serializer = MessageSerializer(
            messages,
            many=True
        )
        return Response(serializer.data)

class SendMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = SendMessageSerializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )
        conversation = serializer.validated_data["conversation"]
        if conversation.company != request.user.company:
            return Response(
                {
                    "detail": "Invalid conversation."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        if not ConversationMember.objects.filter(
            conversation=conversation,
            user=request.user
        ).exists():
            return Response(
                {
                    "detail": "You are not a member."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        message = serializer.save(
            sender=request.user
        )
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )

class DeleteConversationAPIView(APIView):
    permission_classes = [IsAuthenticated,IsOwnerOrHROrManager]

    def delete(self, request, conversation_id):

        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            company=request.user.company
        )

        membership = ConversationMember.objects.filter(
            conversation=conversation,
            user=request.user
        ).first()

        if not membership:
            return Response(
                {"detail": "You are not a member of this conversation."},
                status=status.HTTP_403_FORBIDDEN
            )

        if conversation.conversation_type == "group" and not membership.is_admin:
            return Response(
                {"detail": "Only group admin can delete this group."},
                status=status.HTTP_403_FORBIDDEN
            )

        conversation.is_active = False
        conversation.save(update_fields=["is_active"])

        return Response(
            {"detail": "Conversation deleted."},
            status=status.HTTP_200_OK
        )

class DeleteMessageAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):

        message = get_object_or_404(
            Message,
            id=message_id
        )

        if message.sender != request.user:

            return Response(
                {
                    "detail": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        message.deleted = True
        message.save()

        return Response(
            {
                "detail": "Message deleted."
            }
        )

class UpdateMessageAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, message_id):

        message = get_object_or_404(
            Message,
            id=message_id
        )

        if message.sender != request.user:

            return Response(
                {
                    "detail": "Permission denied."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        message.message = request.data.get(
            "message",
            message.message
        )

        message.edited = True

        message.save()

        return Response(
            MessageSerializer(message).data
        )
