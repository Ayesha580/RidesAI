from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .predefined_questions import PREDEFINED_QUESTIONS
from .serializers import SupportQuestionSerializer


class SupportQuestionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = SupportQuestionSerializer(
            PREDEFINED_QUESTIONS,
            many=True
        )

        return Response(serializer.data)