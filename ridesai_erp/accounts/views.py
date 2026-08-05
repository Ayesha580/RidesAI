from django.contrib.auth import authenticate, login, get_user_model
from django.contrib.auth.hashers import make_password
from django.core.files.storage import default_storage
from django.db import transaction, IntegrityError
import os
from rest_framework.parsers import MultiPartParser, FormParser
import traceback
from django.core.files.base import ContentFile
from django.core.files import File
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from companies.models import Company, Plan
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.core.mail import send_mail
from django.conf import settings
from .serializers import UserListSerializer
from chat.serializers import ChatUserSerializer

User = get_user_model()


class UserListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.filter(
            company=request.user.company,
            is_active=True
        ).exclude(
            id=request.user.id
        )

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


class RegisterAPIView(APIView):
    """
    Yahan sirf VALIDATE hota hai aur data SESSION mein store hota hai.
    DB mein User/Company yahan CREATE NAHI hote — wo payment complete
    hone ke baad CompleteRegistrationAPIView mein hoga.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = dict(serializer.validated_data)

        # Password ko plain-text session mein kabhi mat rakho
        data["password"] = make_password(data["password"])

        # File object session (JSON) mein store nahi ho sakta,
        # isliye temporarily disk par save karke sirf path rakhenge
        uploaded_file = data.pop("registration_docs", None)
        if uploaded_file:
            temp_path = default_storage.save(
                f"pending_registrations/{uploaded_file.name}",
                uploaded_file
            )
            data["registration_docs_path"] = temp_path

        request.session["register_data"] = data
        request.session.modified = True

        return Response({
            "message": "Registration details saved. Please select a plan to continue.",
            "next_step": "select_plan"
        })


REDIRECT_MAP = {
    User.ROLE_OWNER: "/owner/dashboard",
    User.ROLE_HR: "/hr/dashboard",
    User.ROLE_EMPLOYEE: "/employee/dashboard",
    User.ROLE_MANAGER: "/manager/dashboard",
    User.ROLE_ACCOUNTANT: "/accountant/dashboard",
    User.ROLE_SUPERADMIN: "/admin/dashboard",
}


class CompleteRegistrationAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        register_data = request.session.get("register_data")

        if not register_data:
            return Response(
                {"error": "No pending registration found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = register_data.copy()

        registration_docs_path = data.pop("registration_docs_path", None)
        registration_docs = None

        if registration_docs_path:
            with default_storage.open(registration_docs_path, "rb") as f:
                registration_docs = ContentFile(
                    f.read(),
                    name=os.path.basename(registration_docs_path),
                )

        # -----------------------------
        # Duplicate User Check
        # -----------------------------
        if User.objects.filter(username=data["username"]).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Company.objects.filter(name=data["business_name"]).exists():
            return Response(
                {"error": "Company name already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            with transaction.atomic():

                company = Company.objects.create(
                    name=data["business_name"],
                    business_type=data.get("business_type", ""),
                    address=data.get("business_address", ""),
                    is_registered=data.get("is_registered", False),
                    registration_docs=registration_docs,
                    cnic=data.get("cnic", ""),
                    email=data.get("email", ""),
                    phone=data.get("phone", ""),
                    status=Company.STATUS_ACTIVE,
                    polar_subscription_id=request.session.get(
                        "polar_subscription_id",
                        "",
                    ),
                )

                # -----------------------------
                # Plan
                # -----------------------------
                plan_name = request.session.get("selected_plan_name")
                billing_cycle = request.session.get("selected_billing", "monthly")
                seats = request.session.get("selected_seats", 1)

                if plan_name:
                    try:
                        company.plan = Plan.objects.get(name=plan_name, billing_cycle=billing_cycle)
                    except Plan.DoesNotExist:
                        pass

                company.seats = seats
                company.save()
                user = User(
                    company=company,
                    role=User.ROLE_OWNER,
                    first_name=data.get("first_name", ""),
                    username=data["username"],
                    email=data["email"],
                    phone=data.get("phone", ""),
                    cnic=data.get("cnic", ""),
                )
                user.password = data["password"]  # pehle se hashed hai (RegisterAPIView mein)
                user.save()

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -----------------------------
        # Delete temp uploaded file
        # -----------------------------
        if registration_docs_path:
            try:
                if default_storage.exists(registration_docs_path):
                    default_storage.delete(registration_docs_path)
            except Exception:
                pass

        # -----------------------------
        # Clear Session
        # -----------------------------
        for key in [
            "register_data",
            "selected_plan_name",
            "selected_seats",
            "selected_billing",
            "polar_subscription_id",
        ]:
            request.session.pop(key, None)

        request.session.modified = True

        # -----------------------------
        # Welcome Email
        # -----------------------------
        try:
            send_mail(
                subject="Your account has been created 🎉",
                message=(
                    f"Hi {user.first_name},\n\n"
                    f"Your company '{company.name}' has been created successfully.\n\n"
                    f"Username: {user.username}\n"
                    f"Email: {user.email}\n\n"
                    f"You can now login to your dashboard."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(e)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "redirect": REDIRECT_MAP.get(user.role, "/dashboard"),
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "company_name": company.name,
                    "plan": company.plan.name if company.plan else None,
                    "seats": company.seats,
                },
            }
        )

class LoginAPIView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = []   # <-- Add this

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if not user:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response({

            "access": str(refresh.access_token),
            "refresh": str(refresh),

            "redirect": REDIRECT_MAP.get(
                user.role,
                "/dashboard"
            ),

            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "company_name": (
                    user.company.name
                    if user.company
                    else ""
                ),
                "plan": (
                    user.company.plan.name
                    if user.company and user.company.plan
                    else None
                ),
            }
        })


class PaymentSuccessAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        company = request.user.company

        if not company:
            return Response(
                {
                    "error": "Company not found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        company.status = Company.STATUS_ACTIVE
        company.save(update_fields=["status"])

        return Response(
            {
                "message": "Payment successful.",
                "redirect": "/owner/dashboard",
            }
        )

class OwnerProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        company = user.company

        data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "phone": user.phone,
            "cnic": user.cnic or "",
            "business_name": "",
            "business_type": "",
            "business_address": "",
            "registration_docs_url": None,
            "registration_docs_name": "",
        }

        if company:
            data["business_name"] = company.name
            data["business_type"] = company.business_type
            data["business_address"] = company.address

            if company.registration_docs:
                data["registration_docs_url"] = request.build_absolute_uri(
                    company.registration_docs.url
                )
                data["registration_docs_name"] = company.registration_docs.name.split("/")[-1]

        return Response(data)

    def put(self, request):
        user = request.user
        company = user.company
        data = request.data

        # ---- User fields ----
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.phone = data.get("phone", user.phone)

        new_email = data.get("email")
        if new_email and new_email != user.email:
            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"error": "Email already in use."}, status=400)
            user.email = new_email

        new_cnic = data.get("cnic")
        if new_cnic and new_cnic != user.cnic:
            if User.objects.filter(cnic=new_cnic).exclude(id=user.id).exists():
                return Response({"error": "CNIC already in use."}, status=400)
            user.cnic = new_cnic

        user.save()

        # ---- Company fields ----
        if company:
            company.name = data.get("business_name", company.name)
            company.business_type = data.get("business_type", company.business_type)
            company.address = data.get("business_address", company.address)

            # Naya registration doc upload hua ho to
            new_doc = request.FILES.get("registration_docs")
            if new_doc:
                company.registration_docs = new_doc

            company.save()

        return Response({"message": "Profile updated successfully."})