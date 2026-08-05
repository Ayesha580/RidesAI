from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json, time
from companies.models import Plan
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from companies.models import Company


class PolarWebhookAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        event = request.data.get("type")
        data = request.data.get("data", {})
        if event == "subscription.created":
            print("Subscription ID:", data.get("id"))
        return Response({"ok": True})


class PaymentSuccessAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        checkout_id = request.data.get("checkout_id")

        if not checkout_id:
            return Response(
                {"error": "checkout_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription_id = None
        checkout = {}
        for _ in range(3):
            response = requests.get(
                f"https://api.polar.sh/v1/checkouts/{checkout_id}",
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}"
                },
                timeout=20,
            )
            checkout = response.json()

            subscription_id = checkout.get("subscription_id")

            if subscription_id:
                break

            time.sleep(2)
        if not subscription_id and checkout.get("customer_id"):

            customer_id = checkout.get("customer_id")

            sub_response = requests.get(
                f"https://api.polar.sh/v1/subscriptions/?customer_id={customer_id}",
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}"
                },
                timeout=20,
            )
            subscriptions = sub_response.json()

            items = subscriptions.get("items", [])

            # Only save active subscription
            for sub in items:
                if sub.get("status") == "active":
                    subscription_id = sub.get("id")
                    break

        if checkout.get("status") != "succeeded":
            return Response(
                {"error": "Payment not completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )


        if not subscription_id:
            return Response(
                {
                    "error": "Subscription not created yet. Please try again."
                },
                status=400
            )


        request.session["polar_subscription_id"] = subscription_id
        request.session.modified = True


        return Response({
            "success": True,
            "subscription_id": subscription_id,
            "redirect": "/complete-registration/"
        })
class CreateCheckoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        register_data = request.session.get("register_data")
        if not register_data:
            return Response(
                {"error": "No pending registration found. Please register again."},
                status=400
            )

        plan_name = request.data.get("plan")
        billing = request.data.get("billing", "monthly")
        plan_products = settings.POLAR_PRODUCTS.get(plan_name)
        if not plan_products:
            return Response({"error": "Invalid plan"}, status=400)
        product_id = plan_products.get(billing)
        if not product_id:
            return Response({"error": "Invalid billing cycle"}, status=400)
        try:
            seats = int(request.data.get("seats", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid seats value"}, status=400)

        if seats < 1:
            return Response({"error": "Seats must be at least 1"}, status=400)

        payload = {
            "products": [
                product_id
            ],
            "seats": seats,
            "success_url": "https://ridesai.cloud/payment-success?checkout_id={CHECKOUT_ID}",
            "return_url": "https://ridesai.cloud/checkout",
            "customer_email": register_data.get("email", ""),
            "metadata": {
                "session_key": request.session.session_key,
                "username": register_data.get("username", ""),
                "billing": billing,
                "seats": seats,
                "plan": plan_name,
            },
        }
        request.session["selected_plan_name"] = plan_name
        request.session["selected_seats"] = seats
        request.session["selected_billing"] = billing   # 👈 YE LINE ADD KAREIN
        request.session.modified = True

        try:
            response = requests.post(
                "https://api.polar.sh/v1/checkouts/",
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=20,
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Polar checkout create failed",
                    "detail": str(e),
                    "polar_response": response.text if 'response' in locals() else None,
                },
                status=502,
            )

        data = response.json()
        return Response({
            "checkout_url": data.get("url"),
            "checkout_id": data.get("id"),
        })    

class UpgradePlanAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = request.user.company
        if not company:
            return Response({"error": "Company not found."}, status=400)
        if not company.polar_subscription_id:
            return Response(
                {"error": "No active subscription found for this company."},
                status=400
            )

        plan_name = request.data.get("plan")
        billing_cycle = request.data.get("billing", "monthly")
        plan_products = settings.POLAR_PRODUCTS.get(plan_name)
        if not plan_products:
            return Response({"error": "Invalid plan"}, status=400)

        product_id = plan_products.get(billing_cycle)
        if not product_id:
            return Response({"error": "Invalid billing cycle"}, status=400)

        try:
            seats = int(request.data.get("seats", 1))
        except (TypeError, ValueError):
            return Response({"error": "Invalid seats value"}, status=400)

        if seats < 1:
            return Response({"error": "Seats must be at least 1"}, status=400)

        headers = {
            "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        subscription_url = (
            f"https://api.polar.sh/v1/subscriptions/"
            f"{company.polar_subscription_id}"
        )

        plan_changed = (
            not company.plan or company.plan.name != plan_name
        )
        seats_changed = company.seats != seats

        # --- 1) Product/plan change hai to pehle wo update karein ---
        if plan_changed:
            try:
                response = requests.patch(
                    subscription_url,
                    headers=headers,
                    json={
                        "product_id": product_id,
                        "proration_behavior": "invoice",
                    },
                    timeout=20,
                )
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                return Response(
                    {
                        "error": "Plan change failed",
                        "detail": str(e),
                        "polar_response": response.text if 'response' in locals() else None,
                    },
                    status=502,
                )

        # --- 2) Seats change hai to alag se update karein ---
        if seats_changed:
            try:
                response = requests.patch(
                    subscription_url,
                    headers=headers,
                    json={
                        "seats": seats,
                        "proration_behavior": "invoice",
                    },
                    timeout=20,
                )
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                return Response(
                    {
                        "error": "Seat update failed",
                        "detail": str(e),
                        "polar_response": response.text if 'response' in locals() else None,
                    },
                    status=502,
                )

        if not plan_changed and not seats_changed:
            return Response({"message": "No changes to apply."})

        try:
            company.plan = Plan.objects.get(name=plan_name,billing_cycle=billing_cycle)
        except Plan.DoesNotExist:
            pass
        company.seats = seats
        company.save(update_fields=["plan", "seats"])

        return Response({
            "message": "Plan upgraded successfully.",
            "plan": plan_name,
            "seats": seats,
        })

