from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import HerryConversation
from .quota import check_herry_quota, get_herry_plan_info
from .tool_router import execute_tool
from .chat_services import (
    get_or_create_conversation,
    save_user_message,
    save_herry_message,
    get_conversation_history,
)

from .ai_service import generate_herry_response


class HerryToolView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        tool_name = request.data.get("tool")

        if not tool_name:
            return Response(
                {
                    "success": False,
                    "error": "Tool name is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = execute_tool(
                request.user,
                tool_name
            )

            if hasattr(result, "__iter__") and not isinstance(result, dict):
                result = list(result)

            return Response({
                "success": True,
                "tool": tool_name,
                "data": result
            })

        except PermissionError as e:

            return Response(
                {
                    "success": False,
                    "error": str(e)
                },
                status=status.HTTP_403_FORBIDDEN
            )


        except Exception as e:

            import traceback

            print("\n========== HERRY ERROR ==========")

            print(type(e).__name__)

            print(str(e))

            traceback.print_exc()

            print("=================================\n")

            return Response(

                {

                    "success": False,

                    "error": str(e),

                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,

            )


class HerryChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = request.data.get("message", "").strip()
        conversation_id = request.data.get("conversation_id")

        if not message:
            return Response(
                {
                    "success": False,
                    "error": "Message is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        company = getattr(request.user, "company", None)

        if not company:
            return Response(
                {
                    "success": False,
                    "error": "User is not associated with a company."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # HERRY QUOTA CHECK
        # =====================================================

        allowed, usage = check_herry_quota(company)

        if not allowed:

            return Response(
                {
                    "success": False,
                    "limit_reached": True,

                    "error": (
                        "You have reached your Herry message limit "
                        f"of {usage['limit']} messages for your "
                        f"{usage['billing_interval']} plan."
                    ),

                    "message": (
                        "Your Herry message limit has been reached. "
                        "Please upgrade your plan to continue using Herry."
                    ),

                    "usage": {
                        "used": usage["used"],
                        "limit": usage["limit"],
                        "remaining": usage["remaining"],
                        "percentage": usage["percentage"],
                        "plan": usage["plan"],
                        "billing_interval": usage["billing_interval"],
                        "price": usage["price"],
                    },
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            # =================================================
            # GET / CREATE CONVERSATION
            # =================================================

            conversation = get_or_create_conversation(
                user=request.user,
                conversation_id=conversation_id,
            )

            # =================================================
            # SAVE USER MESSAGE
            # =================================================

            save_user_message(
                conversation=conversation,
                message=message,
            )

            # =================================================
            # GET CONVERSATION HISTORY
            # =================================================

            history = get_conversation_history(
                conversation
            )

            # =================================================
            # SEND MESSAGE TO HERRY AI
            # =================================================

            reply = generate_herry_response(
                user=request.user,
                message=message,
                conversation_history=history[:-1],
            )

            # =================================================
            # SAVE HERRY RESPONSE
            # =================================================

            herry_message = save_herry_message(
                conversation=conversation,
                message=reply,
            )

            # =================================================
            # GET UPDATED USAGE
            # =================================================

            updated_usage = get_herry_plan_info(
                company
            )

            # =================================================
            # RESPONSE
            # =================================================

            return Response(
                {
                    "success": True,

                    "conversation_id": conversation.id,

                    "message": {
                        "id": herry_message.id,
                        "role": "assistant",
                        "message": reply,
                        "created_at": herry_message.created_at,
                    },

                    "usage": {
                        "used": updated_usage["used"],
                        "limit": updated_usage["message_limit"],
                        "remaining": updated_usage["remaining"],
                        "percentage": updated_usage["percentage"],
                        "plan": updated_usage["plan"],
                        "billing_interval": updated_usage[
                            "billing_interval"
                        ],
                        "price": updated_usage["price"],
                        "is_limit_reached": updated_usage[
                            "is_limit_reached"
                        ],
                    },
                },
                status=status.HTTP_200_OK,
            )

        except PermissionError as e:

            return Response(
                {
                    "success": False,
                    "error": str(e),
                },
                status=status.HTTP_403_FORBIDDEN,
            )


        except Exception as e:

            import traceback

            print("\n========== HERRY ERROR ==========")

            print(type(e).__name__)

            print(str(e))

            traceback.print_exc()

            print("=================================\n")

            return Response(

                {

                    "success": False,

                    "error": str(e),

                },

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,

            )
class HerryConversationView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):

        conversation = HerryConversation.objects.filter(
            id=conversation_id,
            user=request.user,
            company=request.user.company,
        ).first()

        if not conversation:
            return Response(
                {
                    "success": False,
                    "error": "Conversation not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "success": True,
                "conversation_id": conversation.id,
                "messages": get_conversation_history(
                    conversation
                ),
            }
        )