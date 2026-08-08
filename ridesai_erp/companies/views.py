# companies/api_views.py  (NEW FILE)

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Plan
from .serializers import PlanSerializer


class PlanListAPIView(generics.ListAPIView):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]



class SelectPlanAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"error": "Invalid plan"}, status=400)

        company = request.user.company
        if not company:
            return Response({"error": "No company found for this user"}, status=400)

        company.plan = plan
        company.save(update_fields=["plan"])

        return Response({
            "company_id": company.id,
            "plan": PlanSerializer(plan).data,
            # NEXT STEP: yahan se frontend Checkout page pe redirect karega,
            # jahan Polar checkout session banega (aapka Polar backend code).
        })
