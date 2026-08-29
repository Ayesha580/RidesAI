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
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AdminLoginAPIView(APIView):

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"detail": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_superuser:
            return Response(
                {"detail": "Only RidesAI admin can login here."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.is_active:
            return Response(
                {"detail": "Admin account is inactive."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "is_superuser": user.is_superuser,
        })


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
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = dict(serializer.validated_data)

        # Password hash
        data["password"] = make_password(data["password"])

        file_fields = [
            "business_registration_document",
            "cnic_front",
            "cnic_back",
            "passport_size_photo",
        ]

        for field in file_fields:
            uploaded_file = data.pop(field, None)

            if uploaded_file:
                temp_path = default_storage.save(
                    f"pending_registrations/{field}/{uploaded_file.name}",
                    uploaded_file
                )
                data[f"{field}_path"] = temp_path

        # ==========================================
        # SAVE REGISTRATION DATA IN DJANGO SESSION
        # ==========================================

        request.session["register_data"] = data
        request.session.modified = True

        # IMPORTANT: Force session save
        request.session.save()

        print("====================================")
        print("REGISTRATION SESSION")
        print("SESSION KEY:", request.session.session_key)
        print("SESSION DATA:", dict(request.session))
        print("REGISTER DATA:", request.session.get("register_data"))
        print("====================================")

        return Response({
            "message": "Registration details saved. Please select a plan to continue.",
            "next_step": "select_plan",
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

        print("\n")
        print("=" * 60)
        print("COMPLETE REGISTRATION")
        print("=" * 60)

        register_data = request.session.get("register_data")

        print("REGISTER DATA FROM SESSION:")
        print(register_data)

        if not register_data:
            return Response(
                {"error": "No pending registration found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = register_data.copy()

        # ==========================================
        # FILE FIELDS
        # ==========================================

        file_fields = [
            "business_registration_document",
            "cnic_front",
            "cnic_back",
            "passport_size_photo",
        ]

        uploaded_documents = {}
        temp_file_paths = []

        # ==========================================
        # RESTORE TEMPORARY FILES
        # ==========================================

        print("\n")
        print("=" * 60)
        print("RESTORING TEMPORARY FILES")
        print("=" * 60)

        for field in file_fields:

            path = data.pop(
                f"{field}_path",
                None
            )

            print(f"{field}:")
            print(f"  TEMP PATH: {path}")

            if path:

                temp_file_paths.append(path)

                try:

                    with default_storage.open(
                        path,
                        "rb"
                    ) as f:

                        uploaded_documents[field] = ContentFile(
                            f.read(),
                            name=os.path.basename(path),
                        )

                    print(
                        f"  RESTORED: "
                        f"{uploaded_documents[field].name}"
                    )

                except Exception as e:

                    print(
                        f"  ERROR RESTORING FILE: {e}"
                    )

            else:

                print("  NO FILE")

        # ==========================================
        # DUPLICATE USER CHECK
        # ==========================================

        if User.objects.filter(
            username=data["username"]
        ).exists():

            return Response(
                {
                    "error":
                    "Username already exists."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(
            email=data["email"]
        ).exists():

            return Response(
                {
                    "error":
                    "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Company.objects.filter(
            name=data["business_name"]
        ).exists():

            return Response(
                {
                    "error":
                    "Company name already exists."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================
        # CREATE COMPANY + USER
        # ==========================================

        try:

            with transaction.atomic():

                print("\n")
                print("=" * 60)
                print("CREATING COMPANY")
                print("=" * 60)

                company = Company.objects.create(

                    name=data["business_name"],

                    business_type=data.get(
                        "business_type",
                        ""
                    ),

                    address=data.get(
                        "business_address",
                        ""
                    ),

                    is_registered=data.get(
                        "is_registered",
                        False
                    ),

                    business_registration_document=
                        uploaded_documents.get(
                            "business_registration_document"
                        ),

                    cnic_front=
                        uploaded_documents.get(
                            "cnic_front"
                        ),

                    cnic_back=
                        uploaded_documents.get(
                            "cnic_back"
                        ),

                    passport_size_photo=
                        uploaded_documents.get(
                            "passport_size_photo"
                        ),

                    registration_number=data.get(
                        "registration_number",
                        ""
                    ),

                    cnic=data.get(
                        "cnic",
                        ""
                    ),

                    email=data.get(
                        "email",
                        ""
                    ),

                    phone=data.get(
                        "phone",
                        ""
                    ),

                    status=Company.STATUS_ACTIVE,

                    polar_subscription_id=request.session.get(
                        "polar_subscription_id",
                        ""
                    ),
                )

                # ==========================================
                # PLAN
                # ==========================================

                plan_name = request.session.get(
                    "selected_plan_name"
                )

                billing_cycle = request.session.get(
                    "selected_billing",
                    "monthly"
                )

                seats = request.session.get(
                    "selected_seats",
                    1
                )

                if plan_name:

                    try:

                        company.plan = Plan.objects.get(
                            name=plan_name,
                            billing_cycle=billing_cycle
                        )

                    except Plan.DoesNotExist:

                        print(
                            "PLAN NOT FOUND:",
                            plan_name,
                            billing_cycle
                        )

                company.seats = seats
                company.save()

                print(
                    "COMPANY CREATED:",
                    company.id
                )

                # ==========================================
                # CREATE OWNER
                # ==========================================

                user = User(
                    company=company,
                    role=User.ROLE_OWNER,

                    first_name=data.get(
                        "first_name",
                        ""
                    ),

                    username=data["username"],

                    email=data["email"],

                    phone=data.get(
                        "phone",
                        ""
                    ),

                    cnic=data.get(
                        "cnic",
                        ""
                    ),
                )

                # Password was already hashed
                # inside RegisterAPIView
                user.password = data["password"]

                user.save()

                print(
                    "USER CREATED:",
                    user.username
                )

        except Exception as e:

            traceback.print_exc()

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ==========================================
        # VERIFY SAVED DOCUMENTS
        # ==========================================

        print("\n")
        print("=" * 60)
        print("SAVED COMPANY DOCUMENTS")
        print("=" * 60)

        print(
            "Business Registration:",
            company.business_registration_document.name
            if company.business_registration_document
            else "EMPTY"
        )

        print(
            "CNIC Front:",
            company.cnic_front.name
            if company.cnic_front
            else "EMPTY"
        )

        print(
            "CNIC Back:",
            company.cnic_back.name
            if company.cnic_back
            else "EMPTY"
        )

        print(
            "Passport:",
            company.passport_size_photo.name
            if company.passport_size_photo
            else "EMPTY"
        )

        # ==========================================
        # DELETE TEMPORARY FILES
        # ==========================================

        print("\n")
        print("=" * 60)
        print("DELETING TEMPORARY FILES")
        print("=" * 60)

        for path in temp_file_paths:

            try:

                if default_storage.exists(path):

                    default_storage.delete(path)

                    print(
                        "DELETED:",
                        path
                    )

                else:

                    print(
                        "ALREADY MISSING:",
                        path
                    )

            except Exception as e:

                print(
                    "DELETE ERROR:",
                    path,
                    e
                )

        # ==========================================
        # CLEAR SESSION
        # ==========================================

        for key in [
            "register_data",
            "selected_plan_name",
            "selected_seats",
            "selected_billing",
            "polar_subscription_id",
        ]:

            request.session.pop(
                key,
                None
            )

        request.session.modified = True

        # ==========================================
        # WELCOME EMAIL
        # ==========================================

        try:

            send_mail(
                subject="Your account has been created 🎉",

                message=(
                    f"Hi {user.first_name},\n\n"
                    f"Your company '{company.name}' "
                    f"has been created successfully.\n\n"
                    f"Username: {user.username}\n"
                    f"Email: {user.email}\n\n"
                    f"You can now login to your dashboard."
                ),

                from_email=settings.DEFAULT_FROM_EMAIL,

                recipient_list=[
                    user.email
                ],

                fail_silently=True,
            )

        except Exception as e:

            print(
                "EMAIL ERROR:",
                e
            )

        # ==========================================
        # JWT
        # ==========================================

        refresh = RefreshToken.for_user(
            user
        )

        print("\n")
        print("=" * 60)
        print("REGISTRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)

        return Response(
            {
                "access": str(
                    refresh.access_token
                ),

                "refresh": str(
                    refresh
                ),

                "redirect": REDIRECT_MAP.get(
                    user.role,
                    "/dashboard"
                ),

                "user": {
                    "id": user.id,

                    "first_name":
                        user.first_name,

                    "username":
                        user.username,

                    "email":
                        user.email,

                    "role":
                        user.role,

                    "company_name":
                        company.name,

                    "plan":
                        (
                            company.plan.name
                            if company.plan
                            else None
                        ),

                    "seats":
                        company.seats,
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
            # User information
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "username": user.username or "",
            "email": user.email or "",
            "phone": user.phone or "",
            "cnic": user.cnic or "",

            # Business information
            "business_name": "",
            "business_type": "",
            "business_address": "",
            "registration_number": "",

            # Documents
            "business_registration_document_url": None,
            "business_registration_document_name": "",

            "cnic_front_url": None,
            "cnic_back_url": None,

            "passport_size_photo_url": None,
        }

        if company:

            # -----------------------------
            # Business Information
            # -----------------------------

            data["business_name"] = company.name or ""
            data["business_type"] = company.business_type or ""
            data["business_address"] = company.address or ""
            data["registration_number"] = (
                company.registration_number or ""
            )

            # -----------------------------
            # Business Registration Document
            # -----------------------------

            if company.business_registration_document:
                data["business_registration_document_url"] = (
                    request.build_absolute_uri(
                        company.business_registration_document.url
                    )
                )

                data["business_registration_document_name"] = (
                    company.business_registration_document.name
                    .split("/")[-1]
                )

            # -----------------------------
            # CNIC Front
            # -----------------------------

            if company.cnic_front:
                data["cnic_front_url"] = (
                    request.build_absolute_uri(
                        company.cnic_front.url
                    )
                )

            # -----------------------------
            # CNIC Back
            # -----------------------------

            if company.cnic_back:
                data["cnic_back_url"] = (
                    request.build_absolute_uri(
                        company.cnic_back.url
                    )
                )

            # -----------------------------
            # Passport Size Photo
            # -----------------------------

            if company.passport_size_photo:
                data["passport_size_photo_url"] = (
                    request.build_absolute_uri(
                        company.passport_size_photo.url
                    )
                )

        return Response(data)

    def put(self, request):
        user = request.user
        company = user.company
        data = request.data

        # =================================
        # USER INFORMATION
        # =================================

        user.first_name = data.get(
            "first_name",
            user.first_name
        )

        user.last_name = data.get(
            "last_name",
            user.last_name
        )

        user.phone = data.get(
            "phone",
            user.phone
        )

        # Email
        new_email = data.get("email")

        if new_email and new_email != user.email:

            if User.objects.filter(
                email=new_email
            ).exclude(
                id=user.id
            ).exists():

                return Response(
                    {
                        "error": "Email already in use."
                    },
                    status=400
                )

            user.email = new_email

        # CNIC
        new_cnic = data.get("cnic")

        if new_cnic and new_cnic != user.cnic:

            if User.objects.filter(
                cnic=new_cnic
            ).exclude(
                id=user.id
            ).exists():

                return Response(
                    {
                        "error": "CNIC already in use."
                    },
                    status=400
                )

            user.cnic = new_cnic

        user.save()

        # =================================
        # COMPANY INFORMATION
        # =================================

        if company:

            company.name = data.get(
                "business_name",
                company.name
            )

            company.business_type = data.get(
                "business_type",
                company.business_type
            )

            company.address = data.get(
                "business_address",
                company.address
            )

            company.registration_number = data.get(
                "registration_number",
                company.registration_number
            )

            # =================================
            # DOCUMENTS
            # =================================

            business_doc = request.FILES.get(
                "business_registration_document"
            )

            if business_doc:
                company.business_registration_document = business_doc

            cnic_front = request.FILES.get("cnic_front")

            if cnic_front:
                company.cnic_front = cnic_front

            cnic_back = request.FILES.get("cnic_back")

            if cnic_back:
                company.cnic_back = cnic_back

            passport_photo = request.FILES.get(
                "passport_size_photo"
            )

            if passport_photo:
                company.passport_size_photo = passport_photo

            company.save()

        return Response(
            {
                "message": "Profile updated successfully."
            }
        )