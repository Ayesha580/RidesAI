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
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

from django.conf import settings
from companies.models import Plan


POLAR_API_URL = "https://api.polar.sh"


class SubscriptionDetailsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = getattr(request.user, "company", None)

        if not company:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not company.polar_subscription_id:
            return Response(
                {"error": "No subscription found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        url = (
            f"{POLAR_API_URL}/v1/subscriptions/"
            f"{company.polar_subscription_id}"
        )

        try:
            response = requests.get(
                url,
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
                },
                timeout=20,
            )

            response.raise_for_status()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Failed to fetch subscription.",
                    "detail": str(e),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        subscription = response.json()

        return Response({
            "id": subscription.get("id"),
            "status": subscription.get("status"),
            "product": subscription.get("product"),
            "product_id": subscription.get("product_id"),
            "customer_id": subscription.get("customer_id"),
            "seats": subscription.get("seats"),
            "current_period_start": subscription.get(
                "current_period_start"
            ),
            "current_period_end": subscription.get(
                "current_period_end"
            ),
            "cancel_at_period_end": subscription.get(
                "cancel_at_period_end",
                False
            ),
            "canceled_at": subscription.get("canceled_at"),
        })


# class CustomerPortalAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         company = getattr(request.user, "company", None)

#         if not company:
#             return Response(
#                 {"error": "Company not found."},
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         if not company.polar_subscription_id:
#             return Response(
#                 {"error": "No active subscription found."},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         headers = {
#             "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
#             "Content-Type": "application/json",
#         }

#         subscription_id = company.polar_subscription_id

#         print("====================================")
#         print("CUSTOMER PORTAL REQUEST")
#         print("SUBSCRIPTION ID:", subscription_id)
#         print("====================================")

#         subscription_url = (
#             f"{POLAR_API_URL}/v1/subscriptions/"
#             f"{subscription_id}"
#         )

#         try:
#             response = requests.get(
#                 subscription_url,
#                 headers=headers,
#                 timeout=20,
#             )

#             print("POLAR SUBSCRIPTION STATUS:", response.status_code)
#             print("POLAR SUBSCRIPTION RESPONSE:", response.text)

#             response.raise_for_status()

#             subscription = response.json()

#         except requests.exceptions.RequestException as e:
#             return Response(
#                 {
#                     "error": "Failed to fetch subscription.",
#                     "detail": str(e),
#                     "polar_response": (
#                         response.text
#                         if "response" in locals()
#                         else None
#                     ),
#                 },
#                 status=status.HTTP_502_BAD_GATEWAY,
#             )

#         customer_id = subscription.get("customer_id")

#         if not customer_id:
#             return Response(
#                 {
#                     "error": "Customer ID not found in subscription.",
#                     "subscription": subscription,
#                 },
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         print("====================================")
#         print("POLAR CUSTOMER ID:", customer_id)
#         print("====================================")

#         customer_type = (
#             subscription.get("customer", {})
#             .get("type")
#         )

#         print("POLAR CUSTOMER TYPE:", customer_type)

#         member_id = None
#         member = None

#         # =========================================================
#         # 1. FIRST CHECK EXISTING SEATS
#         # =========================================================

#         seats_url = f"{POLAR_API_URL}/v1/customer-seats"

#         try:
#             seats_response = requests.get(
#                 seats_url,
#                 headers=headers,
#                 params={
#                     "subscription_id": subscription_id,
#                 },
#                 timeout=20,
#             )

#             print("====================================")
#             print("POLAR SEATS STATUS:", seats_response.status_code)
#             print("POLAR SEATS RESPONSE:", seats_response.text)
#             print("====================================")

#             seats_response.raise_for_status()

#             seats_data = seats_response.json()

#         except requests.exceptions.RequestException as e:
#             return Response(
#                 {
#                     "error": "Failed to fetch customer seats.",
#                     "detail": str(e),
#                     "polar_response": (
#                         seats_response.text
#                         if "seats_response" in locals()
#                         else None
#                     ),
#                 },
#                 status=status.HTTP_502_BAD_GATEWAY,
#             )

#         seats = seats_data.get("seats", [])

#         print("====================================")
#         print("POLAR SEATS:")
#         print(json.dumps(seats, indent=4))
#         print("====================================")

#         # =========================================================
#         # 2. FIND ALREADY CLAIMED MEMBER
#         # =========================================================

#         for seat in seats:
#             if seat.get("status") != "revoked":
#                 existing_member = seat.get("member")

#                 if existing_member:
#                     member_id = existing_member.get("id")
#                     member = existing_member
#                     break

#                 if seat.get("member_id"):
#                     member_id = seat.get("member_id")
#                     break

#         # =========================================================
#         # 3. IF NO MEMBER -> ASSIGN FIRST OWNER SEAT
#         # =========================================================

#         if not member_id:

#             customer_email = (
#                 subscription.get("customer", {}).get("email")
#             )

#             if not customer_email:
#                 customer_email = request.user.email

#             print("====================================")
#             print("NO MEMBER FOUND")
#             print("CREATING FIRST OWNER SEAT")
#             print("EMAIL:", customer_email)
#             print("====================================")

#             assign_payload = {
#                 "subscription_id": subscription_id,
#                 "customer_id": customer_id,
#                 "immediate_claim": True,
#             }

#             print("====================================")
#             print("CUSTOMER SEAT PAYLOAD:")
#             print(json.dumps(assign_payload, indent=4))
#             print("====================================")

#             try:
#                 assign_response = requests.post(
#                     seats_url,
#                     headers=headers,
#                     json=assign_payload,
#                     timeout=20,
#                 )

#                 print("====================================")
#                 print(
#                     "CUSTOMER SEAT STATUS:",
#                     assign_response.status_code
#                 )
#                 print(
#                     "CUSTOMER SEAT RESPONSE:",
#                     assign_response.text
#                 )
#                 print("====================================")

#                 assign_response.raise_for_status()

#                 seat_data = assign_response.json()

#             except requests.exceptions.RequestException as e:
#                 return Response(
#                     {
#                         "error": "Failed to assign customer seat.",
#                         "detail": str(e),
#                         "polar_response": (
#                             assign_response.text
#                             if "assign_response" in locals()
#                             else None
#                         ),
#                     },
#                     status=status.HTTP_502_BAD_GATEWAY,
#                 )

#             member_id = seat_data.get("member_id")

#             member = seat_data.get("member")

#             if not member_id and member:
#                 member_id = member.get("id")

#             if not member_id:
#                 return Response(
#                     {
#                         "error": "Polar assigned the seat but did not return member_id.",
#                         "seat": seat_data,
#                     },
#                     status=status.HTTP_502_BAD_GATEWAY,
#                 )

#             print("====================================")
#             print("NEW MEMBER CREATED")
#             print("MEMBER ID:", member_id)
#             print("MEMBER:")
#             print(json.dumps(member, indent=4))
#             print("====================================")

#         else:
#             print("====================================")
#             print("EXISTING MEMBER FOUND")
#             print("MEMBER ID:", member_id)
#             print("MEMBER:")
#             print(json.dumps(member, indent=4))
#             print("====================================")

#         # =========================================================
#         # 4. CREATE CUSTOMER SESSION
#         # =========================================================

#         portal_url = f"{POLAR_API_URL}/v1/customer-sessions"

#         payload = {
#             "customer_id": customer_id,
#             "member_id": member_id,
#             "return_url": "http://localhost:5173/dashboard",
#         }

#         print("====================================")
#         print("POLAR CUSTOMER SESSION PAYLOAD")
#         print(json.dumps(payload, indent=4))
#         print("====================================")

#         try:
#             portal_response = requests.post(
#                 portal_url,
#                 headers=headers,
#                 json=payload,
#                 timeout=20,
#             )

#             print("====================================")
#             print(
#                 "POLAR PORTAL STATUS:",
#                 portal_response.status_code
#             )
#             print(
#                 "POLAR PORTAL RESPONSE:",
#                 portal_response.text
#             )
#             print("====================================")

#             portal_response.raise_for_status()

#         except requests.exceptions.RequestException as e:
#             return Response(
#                 {
#                     "error": "Failed to create customer portal session.",
#                     "detail": str(e),
#                     "polar_response": (
#                         portal_response.text
#                         if "portal_response" in locals()
#                         else None
#                     ),
#                 },
#                 status=status.HTTP_502_BAD_GATEWAY,
#             )

#         try:
#             portal_data = portal_response.json()

#         except ValueError:
#             return Response(
#                 {
#                     "error": "Invalid response received from Polar.",
#                     "polar_response": portal_response.text,
#                 },
#                 status=status.HTTP_502_BAD_GATEWAY,
#             )

#         portal_url_result = portal_data.get(
#             "customer_portal_url"
#         )

#         if not portal_url_result:
#             portal_url_result = portal_data.get("url")

#         if not portal_url_result:
#             return Response(
#                 {
#                     "error": "Polar did not return customer portal URL.",
#                     "polar_response": portal_data,
#                 },
#                 status=status.HTTP_502_BAD_GATEWAY,
#             )

#         print("====================================")
#         print("POLAR PORTAL URL:", portal_url_result)
#         print("CUSTOMER ID:", customer_id)
#         print("MEMBER ID:", member_id)
#         print("====================================")

#         return Response(
#             {
#                 "success": True,
#                 "url": portal_url_result,
#                 "customer_id": customer_id,
#                 "member_id": member_id,
#             },
#             status=status.HTTP_200_OK,
#         )
class CustomerSessionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = getattr(request.user, "company", None)

        if not company:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not company.polar_subscription_id:
            return Response(
                {"error": "No subscription found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        headers = {
            "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }

        subscription_id = company.polar_subscription_id

        try:
            response = requests.get(
                f"{POLAR_API_URL}/v1/subscriptions/{subscription_id}",
                headers=headers,
                timeout=20,
            )

            response.raise_for_status()
            subscription = response.json()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Failed to fetch subscription.",
                    "detail": str(e),
                    "polar_response": response.text if "response" in locals() else None,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        customer_id = subscription.get("customer_id")

        if not customer_id:
            return Response(
                {"error": "Customer ID not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        seats_url = f"{POLAR_API_URL}/v1/customer-seats"

        try:
            seats_response = requests.get(
                seats_url,
                headers=headers,
                params={
                    "subscription_id": subscription_id,
                },
                timeout=20,
            )

            print("SEATS STATUS:", seats_response.status_code)
            print("SEATS RESPONSE:", seats_response.text)

            seats_response.raise_for_status()
            seats_data = seats_response.json()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Failed to fetch customer seats.",
                    "detail": str(e),
                    "polar_response": (
                        seats_response.text
                        if "seats_response" in locals()
                        else None
                    ),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        seats = seats_data.get("seats", [])

        member_id = None
        member = None

        for seat in seats:
            if seat.get("status") == "revoked":
                continue

            existing_member = seat.get("member")

            if existing_member:
                member_id = existing_member.get("id")
                member = existing_member
                break

            if seat.get("member_id"):
                member_id = seat.get("member_id")
                break

        if not member_id:
            try:
                assign_response = requests.post(
                    seats_url,
                    headers=headers,
                    json={
                        "subscription_id": subscription_id,
                        "customer_id": customer_id,
                        "immediate_claim": True,
                    },
                    timeout=20,
                )

                print("ASSIGN SEAT STATUS:", assign_response.status_code)
                print("ASSIGN SEAT RESPONSE:", assign_response.text)

                assign_response.raise_for_status()
                seat_data = assign_response.json()

            except requests.exceptions.RequestException as e:
                return Response(
                    {
                        "error": "Failed to assign customer seat.",
                        "detail": str(e),
                        "polar_response": (
                            assign_response.text
                            if "assign_response" in locals()
                            else None
                        ),
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            member_id = seat_data.get("member_id")
            member = seat_data.get("member")

            if not member_id and member:
                member_id = member.get("id")

        if not member_id:
            return Response(
                {
                    "error": "Could not determine Polar member ID.",
                    "customer_id": customer_id,
                    "seats": seats,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        session_url = f"{POLAR_API_URL}/v1/customer-sessions"

        payload = {
            "customer_id": customer_id,
            "member_id": member_id,
        }

        print("====================================")
        print("CUSTOMER SESSION PAYLOAD:")
        print(json.dumps(payload, indent=4))
        print("====================================")

        try:
            session_response = requests.post(
                session_url,
                headers=headers,
                json=payload,
                timeout=20,
            )

            print("CUSTOMER SESSION STATUS:", session_response.status_code)
            print("CUSTOMER SESSION RESPONSE:", session_response.text)

            session_response.raise_for_status()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Failed to create customer session.",
                    "detail": str(e),
                    "polar_response": session_response.text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            session_data = session_response.json()
        except ValueError:
            return Response(
                {
                    "error": "Invalid customer session response.",
                    "polar_response": session_response.text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "success": True,
                "customer_id": customer_id,
                "member_id": member_id,
                "session": session_data,
            },
            status=status.HTTP_200_OK,
        )
      
class CancelSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = getattr(request.user, "company", None)

        if not company:
            return Response(
                {"error": "Company not found."},
                status=404,
            )

        if not company.polar_subscription_id:
            return Response(
                {"error": "No active subscription found."},
                status=400,
            )

        url = (
            f"{POLAR_API_URL}/v1/subscriptions/"
            f"{company.polar_subscription_id}"
        )

        try:
            response = requests.patch(
                url,
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={
                    "cancel_at_period_end": True,
                },
                timeout=20,
            )

            response.raise_for_status()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Subscription cancellation failed.",
                    "detail": str(e),
                    "polar_response": (
                        response.text
                        if "response" in locals()
                        else None
                    ),
                },
                status=502,
            )

        data = response.json()

        return Response({
            "success": True,
            "message": "Subscription will be canceled at the end of the current billing period.",
            "subscription": data,
        })


class ResumeSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = getattr(request.user, "company", None)

        if not company:
            return Response(
                {"error": "Company not found."},
                status=404,
            )

        if not company.polar_subscription_id:
            return Response(
                {"error": "No subscription found."},
                status=400,
            )

        url = (
            f"{POLAR_API_URL}/v1/subscriptions/"
            f"{company.polar_subscription_id}"
        )

        try:
            response = requests.patch(
                url,
                headers={
                    "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={
                    "cancel_at_period_end": False,
                },
                timeout=20,
            )

            response.raise_for_status()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Failed to resume subscription.",
                    "detail": str(e),
                    "polar_response": (
                        response.text
                        if "response" in locals()
                        else None
                    ),
                },
                status=502,
            )

        return Response({
            "success": True,
            "message": "Subscription resumed successfully.",
            "subscription": response.json(),
        })


class PolarWebhookAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        event = request.data.get("type")
        data = request.data.get("data", {})

        print("====================================")
        print("POLAR WEBHOOK EVENT:", event)
        print("POLAR WEBHOOK DATA:")
        print(json.dumps(data, indent=4))
        print("====================================")

        if event == "subscription.created":
            subscription_id = data.get("id")

            print("SUBSCRIPTION ID:", subscription_id)

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
        print("====================================")
        print("CREATE CHECKOUT REQUEST")
        print("SESSION KEY:", request.session.session_key)
        print("REQUEST DATA:", request.data)
        print("SESSION DATA:", dict(request.session))
        print("====================================")

        # -------------------------------------------------
        # 1. Get registration data from session
        # -------------------------------------------------
        register_data = request.session.get("register_data")

        if not register_data:
            return Response(
                {
                    "error": "No pending registration found. Please register again.",
                    "session_key": request.session.session_key,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 2. Get checkout data
        # -------------------------------------------------
        plan_name = request.data.get("plan")
        billing = request.data.get("billing", "monthly")
        seats_raw = request.data.get("seats", 1)

        print("REGISTER DATA:", register_data)
        print("PLAN:", plan_name)
        
        print("BILLING:", billing)
        print("SEATS:", seats_raw)

        # -------------------------------------------------
        # 3. Validate plan
        # -------------------------------------------------
        plan_products = settings.POLAR_PRODUCTS.get(plan_name)

        if not plan_products:
            return Response(
                {"error": f"Invalid plan: {plan_name}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 4. Get Polar product
        # -------------------------------------------------
        product_id = plan_products.get(billing)

        if not product_id:
            return Response(
                {
                    "error": f"Invalid billing cycle: {billing}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 5. Validate seats
        # -------------------------------------------------
        try:
            seats = int(seats_raw)
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid seats value."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if seats < 1:
            return Response(
                {"error": "Seats must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 6. Get session key
        # -------------------------------------------------
        session_key = request.session.session_key

        if not session_key:
            request.session.create()
            session_key = request.session.session_key

        # -------------------------------------------------
        # 7. Create Polar checkout payload
        # -------------------------------------------------
        payload = {
            "products": [
                product_id
            ],
            "seats": seats,

            "success_url": (
                "http://ridesai.cloud/"
                "payment-success"
                "?checkout_id={CHECKOUT_ID}"
            ),
            "embed_origin": "http://ridesai.cloud/",
            "return_url": (
                "http://ridesai.cloud//checkout"
            ),

            "customer_email": register_data.get(
                "email",
                ""
            ),

            "metadata": {
                "session_key": session_key,
                "username": register_data.get(
                    "username",
                    ""
                ),
                "billing": billing,
                "seats": seats,
                "plan": plan_name,
            },
        }

        print("====================================")
        print("POLAR CHECKOUT PAYLOAD")
        print(payload)
        print("====================================")

        # -------------------------------------------------
        # 8. Save checkout selection in Django session
        # -------------------------------------------------
        request.session["selected_plan_name"] = plan_name
        request.session["selected_seats"] = seats
        request.session["selected_billing"] = billing

        request.session.modified = True

        checkout_url = f"{POLAR_API_URL}/v1/checkouts/"

        headers = {
            "Authorization": (
                f"Bearer {settings.POLAR_ACCESS_TOKEN}"
            ),
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                checkout_url,
                headers=headers,
                json=payload,
                timeout=20,
            )

            print("====================================")
            print("POLAR CHECKOUT STATUS:")
            print(response.status_code)

            print("POLAR CHECKOUT RESPONSE:")
            print(response.text)
            print("====================================")

            response.raise_for_status()

        except requests.exceptions.RequestException as e:
            return Response(
                {
                    "error": "Polar checkout creation failed.",
                    "detail": str(e),
                    "polar_response": (
                        response.text
                        if "response" in locals()
                        else None
                    ),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # -------------------------------------------------
        # 10. Parse Polar response
        # -------------------------------------------------
        try:
            data = response.json()
        except ValueError:
            return Response(
                {
                    "error": "Invalid response received from Polar.",
                    "polar_response": response.text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        checkout_id = data.get("id")
        checkout_url_result = data.get("url")

        if not checkout_id or not checkout_url_result:
            return Response(
                {
                    "error": "Polar did not return checkout details.",
                    "polar_response": data,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # -------------------------------------------------
        # 11. Save checkout ID in session
        # -------------------------------------------------
        request.session["polar_checkout_id"] = checkout_id
        request.session.modified = True

        print("====================================")
        print("CHECKOUT CREATED SUCCESSFULLY")
        print("CHECKOUT ID:", checkout_id)
        print("CHECKOUT URL:", checkout_url_result)
        print("SESSION KEY:", request.session.session_key)
        print("====================================")

        # -------------------------------------------------
        # 12. Return checkout URL to React
        # -------------------------------------------------
        return Response(
            {
                "success": True,
                "checkout_url": checkout_url_result,
                "checkout_id": checkout_id,
            },
            status=status.HTTP_200_OK,
        )


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

