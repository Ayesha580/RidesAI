"""
dashboard/superadmin_views.py

Super Admin (Rides AI internal team) ke liye endpoints:
- Companies list/detail + cascade delete (owner delete => uske saare
  employees/managers/HR bhi delete)
- Users list + delete (kisi bhi company ka koi bhi user)
- Payments/plan-seats overview

In sab views ke liye IsSuperAdmin permission zaroori hai.
"""
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework.permissions import AllowAny
from accounts.models import User
from accounts.permissions import IsSuperAdmin
from companies.models import Company
from hr.models import Employee


# ============================================================
# COMPANIES
# ============================================================

class SuperAdminCompanyListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        companies = Company.objects.select_related("plan").order_by("-created_at")

        data = []
        for company in companies:
            owner = User.objects.filter(
                company=company, role=User.ROLE_OWNER
            ).first()

            data.append({
                "id": company.id,
                "name": company.name,
                "status": company.status,
                "owner": {
                    "id": owner.id,
                    "name": owner.get_full_name() or owner.username,
                    "email": owner.email,
                } if owner else None,
                "plan": company.plan.name if company.plan else None,
                "billing_cycle": company.plan.billing_cycle if company.plan else None,
                "seats": company.seats,
                "employee_count": Employee.objects.filter(company=company).count(),
                "user_count": User.objects.filter(company=company).count(),
                "created_at": company.created_at,
            })

        return Response(data)


class SuperAdminCompanyDetailAPIView(APIView):
    """
    GET  -> company ki full hierarchy: owner, managers, HR, employees
    DELETE -> company + uske SAARE users (owner/managers/HR/employees) delete.
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        users = User.objects.filter(company=company).select_related(
            "employee_profile"
        )

        members = {
            "owner": [],
            "manager": [],
            "hr": [],
            "employee": [],
            "accountant": [],
        }

        for u in users:
            employee = getattr(u, "employee_profile", None)
            entry = {
                "id": u.id,
                "name": u.get_full_name() or u.username,
                "email": u.email,
                "phone": u.phone,
                "designation": employee.designation if employee else "",
                "is_active": u.is_active,
            }
            members.setdefault(u.role, []).append(entry)

        return Response({
            "id": company.id,
            "name": company.name,
            "status": company.status,
            "plan": company.plan.name if company.plan else None,
            "billing_cycle": company.plan.billing_cycle if company.plan else None,
            "seats": company.seats,
            "polar_subscription_id": company.polar_subscription_id,
            "members": members,
        })

    def delete(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        company_name = company.name

        with transaction.atomic():
            users = User.objects.filter(company=company)
            user_count = users.count()

            # JWT tokens pehle clear karo (owner/employees turant logout ho jayein)
            OutstandingToken.objects.filter(user__in=users).delete()

            # User delete se Employee (OneToOne CASCADE), Task.assigned_to,
            # Message.sender, ConversationMember waghera sab CASCADE se delete
            users.delete()

            # Baaki company-scoped data (Lead, Conversation, Attendance,
            # Applicant, Announcement, OfferLetter...) Company FK CASCADE
            # se yahan delete ho jata hai
            company.delete()

        return Response({
            "message": (
                f"Company '{company_name}' aur uske {user_count} users "
                f"(owner, managers, HR, employees) sab delete ho gaye."
            )
        })


# ============================================================
# USERS
# ============================================================

class SuperAdminUserListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.select_related(
            "company", "company__plan"
        ).order_by("-id")

        data = [
            {
                "id": u.id,
                "name": u.get_full_name() or u.username,
                "username": u.username,
                "email": u.email,
                "role": u.get_role_display(),
                "role_key": u.role,
                "company": u.company.name if u.company else None,
                "company_id": u.company_id,
                "is_active": u.is_active,
            }
            for u in users
        ]
        return Response(data)


class SuperAdminUserDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user.role == User.ROLE_SUPERADMIN:
            return Response(
                {"error": "Super Admin accounts is page se delete nahi ho sakte."},
                status=400,
            )

        name = user.get_full_name() or user.username

        with transaction.atomic():
            OutstandingToken.objects.filter(user=user).delete()
            user.delete()

        return Response({"message": f"{name} delete ho gaya."})


# ============================================================
# PAYMENTS / PLANS
# ============================================================

class SuperAdminPaymentsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        companies = Company.objects.select_related("plan").order_by("-created_at")

        data = []
        for company in companies:
            data.append({
                "company_id": company.id,
                "company_name": company.name,
                "plan": company.plan.name if company.plan else None,
                "billing_cycle": company.plan.billing_cycle if company.plan else None,
                "price": str(company.plan.price) if company.plan else None,
                "seats": company.seats,
                "status": company.status,
                "polar_subscription_id": company.polar_subscription_id,
            })

        return Response(data)