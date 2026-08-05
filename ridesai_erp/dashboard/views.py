from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from crm.models import Lead
from hr.models import Employee, Attendance, Task
from accounts.models import User
from accounts.permissions import IsAccountant, IsOwner,IsHR,IsEmployee,IsManager


class OwnerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request):
        if request.user.role != User.ROLE_OWNER:
            return Response({"error": "Permission denied"}, status=403)

        if not request.user.company:
            return Response({"error": "Company not found"}, status=404)
        company = request.user.company
        employees_qs = Employee.objects.filter(company=company)
        tasks_qs = Task.objects.filter(company=company)
        leads_qs = Lead.objects.filter(company=company)

        staff_qs = (
            User.objects.filter(
                company=company,
                is_active=True
            )
            .exclude(role=User.ROLE_OWNER)
            .order_by("-id")
        )

        recent_staff = []

        for user in staff_qs[:5]:
            employee = getattr(user, "employee_profile", None)

            recent_staff.append({
                "id": user.id,
                "name": user.get_full_name() or user.username,
                "role": user.get_role_display(),
                "department": (
                        employee.department
                        or employee.designation
                        or "-"
                ) if employee else "-",
            })

        recent_tasks = [
            {
                "id": task.id,
                "title": task.title,
                "status": task.get_status_display(),
            }
            for task in tasks_qs.order_by('-created_at')[:5]
        ]

        return Response({
            "plan": {
                "name": company.plan.name if company.plan else None,
                "billing": company.billing_interval if hasattr(company, "billing_interval") else "monthly",
                "seats": company.seats,
                "price_per_seat": (
                    company.plan.price
                    if company.plan
                    else None
                )
            },

            "employees": Employee.objects.filter(
                company=company,
                user__role=User.ROLE_EMPLOYEE,
                user__is_active=True
            ).count(),

            "attendance": Attendance.objects.filter(
                company=company
            ).count(),

            "tasks": tasks_qs.exclude(
                status=Task.STATUS_DONE
            ).count(),

            "leads": leads_qs.count(),

            "hrs": User.objects.filter(
                company=company,
                role=User.ROLE_HR,
                is_active=True
            ).count(),

            "managers": User.objects.filter(
                company=company,
                role=User.ROLE_MANAGER,
                is_active=True
            ).count(),

            "recent_staff": recent_staff,
            "recent_tasks": recent_tasks,
        })


class HRDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated,IsHR]

    def get(self, request):
        if request.user.role != User.ROLE_HR:
            return Response({"error": "Permission denied"}, status=403)

        if not request.user.company:
            return Response({"error": "Company not found"}, status=404)
        company = request.user.company

        employees = (
            Employee.objects.filter(
                company=company,
                user__role=User.ROLE_EMPLOYEE,
                user__is_active=True,
            )
            .select_related("user")
        )

        recent_employees = [
            {
                "id": emp.id,
                "name": emp.user.get_full_name() or emp.user.username,
                "designation": emp.designation,
            }
            for emp in employees.order_by("-id")[:5]
        ]

        return Response({
            "company_name": company.name,
            "hr_name": request.user.get_full_name(),
            "employees": employees.count(),
            "attendance_today": Attendance.objects.filter(
                company=company,
                employee__user__role=User.ROLE_EMPLOYEE,
                date=timezone.localdate(),
            ).count(),
            "recent_employees": recent_employees,
        })

class EmployeeDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):

        if request.user.role != User.ROLE_EMPLOYEE:
            return Response({"error": "Permission denied"}, status=403)

        employee = request.user.employee_profile

        tasks = Task.objects.filter(
            assigned_to=request.user
        )

        pending = tasks.exclude(status=Task.STATUS_DONE)
        completed = tasks.filter(status=Task.STATUS_DONE)

        today_attendance = Attendance.objects.filter(
            employee=employee,
            date=timezone.localdate()
        ).first()

        recent_tasks = [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "status": t.get_status_display(),
            }
            for t in tasks.order_by("-created_at")[:5]
        ]

        return Response({

            "employee": {
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
                "designation": employee.designation,
            },

            "total_tasks": tasks.count(),

            "pending_tasks": pending.count(),

            "completed_tasks": completed.count(),

            "working_hours": (
                today_attendance.worked_hours
                if today_attendance else 0
            ),

            "clock_in": (
                today_attendance.clock_in
                if today_attendance else None
            ),

            "clock_out": (
                today_attendance.clock_out
                if today_attendance else None
            ),

            "tasks": recent_tasks,

            "performance": 85,

            "leave_balance": 12,

            "announcements": [
                {
                    "id": 1,
                    "title": "Welcome to Rides AI"
                }
            ]
        })


class ManagerDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.ROLE_MANAGER:
            return Response(
                {"error": "Permission denied"},
                status=403
            )

        employee_count = Employee.objects.filter(
            company=request.user.company
        ).count()

        task_count = Task.objects.filter(
            created_by=request.user
        ).count()

        pending_tasks = Task.objects.filter(
            created_by=request.user,
            status="Pending"
        ).count()

        completed_tasks = Task.objects.filter(
            created_by=request.user,
            status="Completed"
        ).count()

        return Response({
            "employees": employee_count,
            "tasks": task_count,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
        })


class AccountantDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.ROLE_MANAGER:
            return Response({"error": "Permission denied"}, status=403)
        company = request.user.company
        return Response({
            "employees": Employee.objects.filter(company=company).count(),
            # billing/accounting data yahan add karein
        })


class CRMDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = request.user.company

        recent_leads = [
            {"id": l.id, "full_name": l.full_name, "status": l.get_status_display()}
            for l in Lead.objects.filter(company=company).order_by('-created_at')[:5]
        ]

        return Response({
            "leads": Lead.objects.filter(company=company).count(),
            "recent_leads": recent_leads,
        })