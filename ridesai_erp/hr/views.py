from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.http import HttpResponseNotAllowed
from django.shortcuts import get_object_or_404
from .forms import EmployeeCreateForm, TaskForm, HRCreateForm
from accounts.decorators import role_required
from integrations.services import get_mailbox
from integrations.gmail import send_html_email
from integrations.models import Mailbox
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer
from accounts.models import User
from .serializers import TaskSerializer
from .models import Attendance, Employee, Task, Leave, Notification, Announcement
from .utils import calculate_distance
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth import login
from .models import Applicant
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import User
from rest_framework.decorators import api_view, permission_classes
from .models import OfferLetter
from .serializers import OfferLetterSerializer, LeaveSerializer, NotificationSerializer, AnnouncementSerializer
import csv
from decimal import Decimal
from django.http import HttpResponse
from .serializers import ApplicantSerializer
from accounts.permissions import IsEmployee,IsManager,IsHR
from accounts.permissions import IsOwner

from .serializers import EmployeeProfileSerializer
from .models import EmployeeDocument
from .serializers import EmployeeDocumentSerializer
from datetime import time, datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsEmployee
from accounts.models import User
from .models import Attendance, Break, Employee
from .serializers import AttendanceSerializer
from .utils import get_client_ip, ip_allowed, get_today_attendance
from accounts.permissions import IsHR
from chat.models import Conversation, ConversationMember
from zoneinfo import available_timezones
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Screenshot
from .serializers import ScreenshotSerializer

DEFAULT_SHIFT_START = time(9, 15)


@api_view(["GET"])
def timezone_list(request):
    return Response(sorted(list(available_timezones())))

class OfficeHoursAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = request.user.company

        return Response({
            "shift_start": company.shift_start.strftime("%H:%M"),
            "shift_end": company.shift_end.strftime("%H:%M"),
            "timezone": company.timezone,
        })

    def put(self, request):
        if request.user.role != User.ROLE_OWNER:
            return Response({"error": "Permission denied"}, status=403)

        company = request.user.company

        shift_start = request.data.get("shift_start")
        shift_end = request.data.get("shift_end")
        timezone_name = request.data.get("timezone")

        try:
            if shift_start:
                company.shift_start = datetime.strptime(
                    shift_start, "%H:%M"
                ).time()

            if shift_end:
                company.shift_end = datetime.strptime(
                    shift_end, "%H:%M"
                ).time()

        except ValueError:
            return Response(
                {"error": "Time format should be HH:MM"},
                status=400,
            )

        if timezone_name:
            if timezone_name not in available_timezones():
                return Response(
                    {"error": "Invalid timezone"},
                    status=400,
                )

            company.timezone = timezone_name

        company.save(
            update_fields=[
                "shift_start",
                "shift_end",
                "timezone",
            ]
        )

        return Response({
            "message": "Office hours updated successfully",
            "shift_start": company.shift_start.strftime("%H:%M"),
            "shift_end": company.shift_end.strftime("%H:%M"),
            "timezone": company.timezone,
        })
class UploadScreenshotAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def post(self, request):
        employee = request.user.employee_profile
        image = request.FILES.get("image")

        if not image:
            return Response({"error": "Image is required"}, status=400)

        attendance = get_today_attendance(employee)

        Screenshot.objects.create(
            company=employee.company,
            employee=employee,
            attendance=attendance if attendance and attendance.clock_in else None,
            image=image,
        )

        return Response({"message": "Screenshot uploaded"})




class ScreenshotListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
            return Response({"error": "Permission denied"}, status=403)

        screenshots = Screenshot.objects.filter(
            company=request.user.company
        ).select_related("employee", "employee__user")

        employee_id = request.query_params.get("employee_id")
        date_filter = request.query_params.get("date")

        if employee_id:
            screenshots = screenshots.filter(employee_id=employee_id)
        if date_filter:
            screenshots = screenshots.filter(captured_at__date=date_filter)

        screenshots = screenshots[:200]
        serializer = ScreenshotSerializer(screenshots, many=True, context={"request": request})
        return Response(serializer.data)


def _parse_coord(value):
    try:
        return float(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None

def _mark_late_if_needed(attendance, employee):
    shift_start = getattr(employee.company, "shift_start", DEFAULT_SHIFT_START)
    local_clock_in = timezone.localtime(attendance.clock_in)
    if local_clock_in.time() > shift_start:
        attendance.is_late = True



# manager
class ManagerCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    def post(self, request):
        print(request.data)
        company = request.user.company
        data = request.data
        email = data.get("email")
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=400,
            )
        current_users = User.objects.filter(
            company=company,
            is_active=True
        ).exclude(role=User.ROLE_OWNER).count()
        if current_users >= company.seats:
            return Response(
                {
                    "error": "Your seat limit has been reached. Please upgrade your plan."
                },
                status=400
            )
        user = User.objects.create_user(
            username=data.get("username"),
            email=data.get("email"),
            password=data.get("password"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            role=User.ROLE_MANAGER,
            company=company,
        )
        employee = Employee.objects.create(
            company=company,
            user=user,
            phone=data.get("phone"),
            age=data.get("age"),
            designation=data.get("designation"),
            department=data.get("department") or "",  # ya "Management"
            joining_date=data.get("joining_date"),
            salary=data.get("salary") or 0,
            employment_type=data.get("employment_type") or "Full Time",
            gender=data.get("gender"),
            address=data.get("address"),
            emergency_contact=data.get("emergency_contact"),
            emergency_phone=data.get("emergency_phone"),
        )
        general = Conversation.objects.filter(
            company=company,
            conversation_type=Conversation.GENERAL
        ).first()

        announcement = Conversation.objects.filter(
            company=company,
            conversation_type=Conversation.ANNOUNCEMENT
        ).first()

        management = Conversation.objects.filter(
            company=company,
            conversation_type=Conversation.MANAGEMENT
        ).first()

        if general:
            ConversationMember.objects.get_or_create(
                conversation=general,
                user=user,
            )

        if announcement:
            ConversationMember.objects.get_or_create(
                conversation=announcement,
                user=user,
            )

        if management:
            ConversationMember.objects.get_or_create(
                conversation=management,
                user=user,
                defaults={
                    "is_admin": True
                }
            )
        return Response({
            "message": "Manager created successfully.",
            "id": employee.id
        })
class ManagerListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
            return Response({"error": "Permission denied"}, status=403)
        company = request.user.company
        managers = Employee.objects.filter(
            company=company,
            user__role=User.ROLE_MANAGER
        ).select_related("user")
        data = []
        for m in managers:
            data.append({
                "id": m.user.id,
                "name": m.user.get_full_name(),
                "username": m.user.username,
                "email": m.user.email,
                "phone": m.phone,
                "department": m.department,
                "designation": m.designation,
                "status": m.status,
            })

        return Response(data)
class ManagerDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def put(self, request, pk):
        manager = get_object_or_404(
            Employee,
            pk=pk,
            company=request.user.company,
            user__role=User.ROLE_MANAGER,
        )

        data = request.data

        manager.phone = data.get("phone", manager.phone)
        manager.department = data.get("department", manager.department)
        manager.designation = data.get("designation", manager.designation)
        manager.salary = data.get("salary", manager.salary)
        manager.joining_date = data.get("joining_date", manager.joining_date)
        manager.save()

        manager.user.first_name = data.get(
            "first_name",
            manager.user.first_name,
        )
        manager.user.last_name = data.get(
            "last_name",
            manager.user.last_name,
        )
        manager.user.email = data.get(
            "email",
            manager.user.email,
        )
        manager.user.username = manager.user.email
        manager.user.save()
        return Response({"message": "Updated successfully."})

class ManagerDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def delete(self, request, pk):
        manager = get_object_or_404(
            Employee,
            user_id=pk,
            company=request.user.company,
            user__role=User.ROLE_MANAGER,
        )

        manager.user.delete()

        return Response({
            "message": "Manager deleted successfully."
        })

class HRDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def delete(self, request, pk):
        hr_user = get_object_or_404(
            User,
            id=pk,
            company=request.user.company,
            role=User.ROLE_HR,
        )

        name = hr_user.get_full_name() or hr_user.username
        hr_user.delete()

        return Response({
            "message": f"{name} has been deleted successfully."
        })

class ManagerTeamAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsManager
    ]

    def get(self, request):

        employees = Employee.objects.filter(
            manager=request.user,
            company=request.user.company
        ).select_related("user")


        data = []

        for emp in employees:
            data.append({
                "id": emp.user.id,
                "employee_id": emp.id,
                "name": emp.user.get_full_name()
                        or emp.user.username,

                "designation": emp.designation,
                "department": emp.department,
                "email": emp.user.email
            })


        return Response(data)

class ManagerCreateTaskAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsManager
    ]

    def post(self, request):

        task = Task.objects.create(
            company=request.user.company,
            created_by=request.user,
            assigned_to_id=request.data.get("assigned_to"),
            title=request.data.get("title"),
            description=request.data.get("description", ""),
            priority=request.data.get("priority", Task.PRIORITY_MEDIUM),
            due_date=request.data.get("due_date")
        )

        # ==========================
        # CREATE NOTIFICATION
        # ==========================

        employee = Employee.objects.get(
            user=task.assigned_to
        )

        Notification.objects.create(
            company=request.user.company,
            employee=employee,
            manager=request.user,
            title="New Task Assigned",
            message=f"You have been assigned a new task: {task.title}",
            notification_type="Task"
        )

        return Response({
            "message": "Task created",
            "id": task.id
        })
class ManagerTaskListAPIView(APIView):
    permission_classes=[
        IsAuthenticated,
        IsManager
    ]
    def get(self,request):
        tasks = Task.objects.filter(
            created_by=request.user
        )
        data=[]

        for task in tasks:

            data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "assigned_to":
                    task.assigned_to.get_full_name()
                    if task.assigned_to else "",
                "priority":
                    task.get_priority_display(),
                "status":
                    task.get_status_display(),
                "due_date":
                    task.due_date.strftime("%Y-%m-%d")
                    if task.due_date else ""

            })

        return Response(data)
class ManagerDeleteTaskAPIView(APIView):

    permission_classes=[
        IsAuthenticated,
        IsManager
    ]


    def delete(self,request,pk):

        try:
            task = Task.objects.get(
                id=pk,
                created_by=request.user
            )

            task.delete()

            return Response({
                "message":"Task deleted"
            })


        except Task.DoesNotExist:

            return Response(
                {
                    "error":"Task not found"
                },
                status=404
            )
class EmployeeCompleteTaskAPIView(APIView):

    permission_classes=[
        IsAuthenticated,
        IsEmployee
    ]


    def put(self,request,pk):

        task=get_object_or_404(
            Task,
            id=pk,
            assigned_to=request.user
        )


        task.status=Task.STATUS_DONE
        task.completion=100
        task.save()


        return Response({
            "message":"Task completed"
        })

class TodayAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        employee = request.user.employee_profile
        attendance = get_today_attendance(employee)
        return Response(AttendanceSerializer(attendance).data)


class MyAttendanceHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        employee = request.user.employee_profile
        records = Attendance.objects.filter(employee=employee)
        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")
        if date_from:
            records = records.filter(date__gte=date_from)
        if date_to:
            records = records.filter(date__lte=date_to)

        records = records.order_by("-date")[:100]
        return Response(AttendanceSerializer(records, many=True).data)


class CompanyAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
            return Response({"error": "Permission denied"}, status=403)

        records = (
            Attendance.objects
            .filter(company=request.user.company)
            .select_related("employee", "employee__user")
            .order_by("-date")
        )
        serializer = AttendanceSerializer(records, many=True)

        date_filter = request.query_params.get("date")
        employee_id = request.query_params.get("employee_id")

        if date_filter:
            records = records.filter(date=date_filter)
        if employee_id:
            records = records.filter(employee_id=employee_id)

        records = records.select_related("employee__user").order_by("-date")[:200]
        return Response(AttendanceSerializer(records, many=True).data)

class CheckInAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def post(self, request):
        employee = request.user.employee_profile
        company = employee.company
        client_ip = get_client_ip(request)

        if not ip_allowed(company, client_ip):
            return Response(
                {"error": "You are not allowed to mark attendance from this network."},
                status=status.HTTP_403_FORBIDDEN,
            )

        attendance = get_today_attendance(employee)

        if attendance.clock_in:
            return Response({"error": "Already checked in."}, status=400)

        attendance.clock_in = timezone.now()
        attendance.login_time = attendance.clock_in
        attendance.clock_in_ip = client_ip
        attendance.clock_in_latitude = _parse_coord(request.data.get("latitude"))
        attendance.clock_in_longitude = _parse_coord(request.data.get("longitude"))
        attendance.device_name = request.data.get("device", "")
        attendance.browser = request.data.get("browser", "")
        attendance.os = request.data.get("os", "")

        _mark_late_if_needed(attendance, employee)

        attendance.save()

        return Response(
            {
                "message": "Checked In Successfully",
                "data": AttendanceSerializer(attendance).data,
            }
        )

class CheckOutAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]
    def post(self, request):
        employee = request.user.employee_profile
        attendance = get_today_attendance(employee)

        if not attendance.clock_in:
            return Response({"error": "Check In first."}, status=400)

        if attendance.clock_out:
            return Response({"error": "Already Checked Out."}, status=400)

        if attendance.is_on_break:
            return Response(
                {"error": "End your current break before clocking out."}, status=400
            )

        attendance.clock_out = timezone.now()
        attendance.logout_time = attendance.clock_out
        attendance.clock_out_ip = get_client_ip(request)
        attendance.clock_out_latitude = _parse_coord(request.data.get("latitude"))
        attendance.clock_out_longitude = _parse_coord(request.data.get("longitude"))
        attendance.save()

        return Response(
            {
                "message": "Checked Out Successfully",
                "data": AttendanceSerializer(attendance).data,
            }
        )

class BreakStartAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]
    def post(self, request):
        employee = request.user.employee_profile
        attendance = get_today_attendance(employee)
        if not attendance.is_open:
            return Response({"error": "Check In first."}, status=400)
        if attendance.is_on_break:
            return Response({"error": "Break already started."}, status=400)
        Break.objects.create(attendance=attendance, break_start=timezone.now())
        return Response(
            {
                "message": "Break Started",
                "data": AttendanceSerializer(attendance).data,
            }
        )

class BreakEndAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]
    def post(self, request):
        employee = request.user.employee_profile
        attendance = get_today_attendance(employee)
        last_break = attendance.breaks.filter(break_end__isnull=True).first()
        if not last_break:
            return Response({"error": "No active break."}, status=400)
        last_break.break_end = timezone.now()
        last_break.save()
        return Response(
            {
                "message": "Break Ended",
                "data": AttendanceSerializer(attendance).data,
            }
        )

class EmployeeDocumentAPIView(APIView):

    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        employee = request.user.employee_profile
        documents = EmployeeDocument.objects.filter(
            employee=employee
        ).order_by("-uploaded_at")
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    def post(self, request):
        employee = request.user.employee_profile
        file_obj = request.FILES.get("file")

        if not file_obj:
            return Response({"error": "File is required"}, status=400)

        title = request.data.get("title") or file_obj.name
        document_type = request.data.get("document_type", "Other")

        document = EmployeeDocument.objects.create(
            employee=employee,
            title=title,
            document_type=document_type,
            file=file_obj,
        )

        serializer = EmployeeDocumentSerializer(document)
        return Response(
            {"message": "Document uploaded successfully", "data": serializer.data},
            status=201,
        )
# ---------- HR: Employee Documents ----------

class HREmployeeDocumentListAPIView(APIView):
    """HR kisi bhi employee ke documents dekh sake."""
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request, employee_id):
        employee = get_object_or_404(
            Employee,
            id=employee_id,
            company=request.user.company,
        )
        documents = EmployeeDocument.objects.filter(
            employee=employee
        ).order_by("-uploaded_at")
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)


class HRDocumentUploadAPIView(APIView):
    """HR kisi employee ke liye document upload kare (CNIC/Contract/Certificate)."""
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request):
        employee_id = request.data.get("employee_id")

        if not employee_id:
            return Response({"error": "employee_id is required"}, status=400)

        employee = get_object_or_404(
            Employee,
            id=employee_id,
            company=request.user.company,
        )

        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"error": "File is required"}, status=400)

        title = request.data.get("title") or file_obj.name
        document_type = request.data.get("document_type", "Other")

        document = EmployeeDocument.objects.create(
            employee=employee,
            title=title,
            document_type=document_type,
            file=file_obj,
        )

        serializer = EmployeeDocumentSerializer(document)
        return Response(
            {"message": "Document uploaded successfully", "data": serializer.data},
            status=201,
        )


class HRDocumentDeleteAPIView(APIView):
    """HR document delete kar sake (sirf apni company ke andar)."""
    permission_classes = [IsAuthenticated, IsHR]

    def delete(self, request, pk):
        document = get_object_or_404(
            EmployeeDocument,
            id=pk,
            employee__company=request.user.company,
        )
        document.delete()
        return Response({"message": "Document deleted successfully"})
class EmployeeProfileAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsEmployee
    ]

    def get(self, request):

        employee = request.user.employee_profile

        serializer = EmployeeProfileSerializer(employee)

        return Response(serializer.data)

    def put(self, request):

        employee = request.user.employee_profile

        serializer = EmployeeProfileSerializer(

            employee,

            data=request.data,

            partial=True

        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(serializer.data)

class SetEmployeeLocationAPIView(APIView):
    permission_classes=[
        IsAuthenticated,
        IsEmployee
    ]
    def post(self,request):
        employee=request.user.employee_profile
        if employee.home_latitude:
            return Response(
                {
                    "error":
                    "Location already set"
                },
                status=400
            )
        employee.home_latitude = request.data.get(
            "latitude"
        )
        employee.home_longitude = request.data.get(
            "longitude"
        )
        employee.save()
        return Response(
            {
                "message":
                "Attendance location saved"
            }
        )

class EmployeeLeaveListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):

        employee = request.user.employee_profile

        leaves = Leave.objects.filter(
            employee=employee
        ).order_by("-created_at")

        serializer = LeaveSerializer(
            leaves,
            many=True
        )

        return Response(serializer.data)

class EmployeeNotificationAPIView(APIView):

    permission_classes=[
        IsAuthenticated,
        IsEmployee
    ]

    def get(self,request):

        employee=request.user.employee_profile

        notifications=Notification.objects.filter(
            employee=employee
        ).order_by("-created_at")

        serializer=NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)
class ReadNotificationAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsEmployee
    ]

    def post(self, request, pk):

        employee = request.user.employee_profile

        notification = get_object_or_404(
            Notification,
            id=pk,
            employee=employee
        )

        notification.is_read = True
        notification.save()

        return Response({
            "message": "Notification marked as read."
        })

class EmployeeNotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):

        employee = request.user.employee_profile

        notifications = (
            Notification.objects.filter(
                employee=employee
            )
            .select_related(
                "company",
                "employee__user",
                "manager",
            )
            .order_by("-created_at")
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)

class ApplyLeaveAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEmployee]

    def post(self, request):

        employee = request.user.employee_profile

        serializer = LeaveSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(
                company=employee.company,
                employee=employee
            )

            return Response(
                {
                    "message": "Leave applied successfully."
                },
                status=201
            )

        return Response(
            serializer.errors,
            status=400
        )
class LeaveListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):

        leaves = Leave.objects.filter(
            company=request.user.company
        ).order_by("-created_at")

        serializer = LeaveSerializer(
            leaves,
            many=True
        )

        return Response(serializer.data)
class LeaveStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def post(self, request, pk):

        leave = get_object_or_404(
            Leave,
            pk=pk,
            company=request.user.company
        )

        status_value = request.data.get("status")
        comment = request.data.get("comment", "")

        if status_value not in ["Approved", "Rejected"]:
            return Response(
                {
                    "error": "Invalid status"
                },
                status=400
            )

        leave.status = status_value
        leave.hr_comment = comment
        leave.approved_by = request.user
        leave.approved_at = timezone.now()
        leave.save()

        return Response(
            {
                "message": f"Leave {status_value.lower()} successfully."
            }
        )
class HRLeaveListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsHR]

    def get(self, request):
        leaves = Leave.objects.filter(
            company=request.user.company
        ).select_related(
            "employee",
            "employee__user"
        ).order_by("-created_at")

        serializer = LeaveSerializer(leaves, many=True)

        return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_hr(request):
    company = request.user.company
    current_users = User.objects.filter(
        company=company,
        is_active=True
    ).exclude(role=User.ROLE_OWNER).count()
    if current_users >= company.seats:
        return Response(
            {
                "error": "Your seat limit has been reached. Please upgrade your plan."
            },
            status=400
        )
    if request.user.role != User.ROLE_OWNER:
        return Response(
            {"error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN,
        )

    form = HRCreateForm(request.data)

    if not form.is_valid():
        return Response(
            form.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = form.save(company=request.user.company)

    user.role = User.ROLE_HR
    user.save(update_fields=["role"])

    # get_or_create se duplicate Employee creation avoid hoga
    employee, created = Employee.objects.get_or_create(
        user=user,
        defaults={
            "company": request.user.company,
            "phone": request.data.get("phone", ""),
            "age": request.data.get("age") or None,
            "designation": request.data.get("designation", ""),
            "department": request.data.get("department", "HR"),
        }
    )

    return Response(
        {
            "message": "HR created successfully",
            "id": user.id,
            "name": user.get_full_name(),
            "email": user.email,
            "designation": employee.designation,
        }
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def hr_list(request):

    if request.user.role != User.ROLE_OWNER:
        return Response(
            {"error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN,
        )

    hrs = User.objects.filter(
        company=request.user.company,
        role=User.ROLE_HR,
    )

    data = []

    for hr in hrs:
        employee = Employee.objects.filter(user=hr).first()

        data.append({
            "id": hr.id,
            "name": hr.get_full_name(),
            "username": hr.username,
            "email": hr.email,
            "phone": hr.phone,
            "designation": employee.designation if employee else "",
        })

    return Response(data)

@api_view(["POST","GET"])
@permission_classes([IsAuthenticated])
def add_applicant(request):
    print('hello')
    if request.user.role not in [
        User.ROLE_OWNER,
        User.ROLE_HR
    ]:
        return Response(
            {"error": "Permission denied"},
            status=403
        )

    data = request.data.copy()
    data["company"] = request.user.company.id

    serializer = ApplicantSerializer(data=data)

    if serializer.is_valid():
        serializer.save(company=request.user.company)

        return Response(
            {
                "message": "Candidate added successfully",
                "data": serializer.data
            },
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicant_list(request):

    applicants = Applicant.objects.filter(
        company=request.user.company
    ).order_by("-created_at")

    serializer = ApplicantSerializer(
        applicants,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_applicant(request, pk):

    applicant = get_object_or_404(
        Applicant,
        id=pk,
        company=request.user.company
    )

    serializer = ApplicantSerializer(
        applicant,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()

        return Response({
            "message": "Candidate updated successfully",
            "data": serializer.data
        })

    return Response(serializer.errors, status=400)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_applicant(request, pk):

    applicant = get_object_or_404(
        Applicant,
        id=pk,
        company=request.user.company
    )

    applicant.delete()

    return Response({
        "message": "Candidate deleted successfully"
    })

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_applicant_status(request, pk):

    applicant = get_object_or_404(
        Applicant,
        id=pk,
        company=request.user.company
    )

    status_value = request.data.get("status")

    if status_value not in [
        "Pending",
        "Selected",
        "Rejected"
    ]:
        return Response(
            {"error": "Invalid status"},
            status=400
        )

    applicant.status = status_value
    applicant.save()

    return Response({
        "message": "Status updated successfully"
    })

@api_view(["GET"])
@permission_classes([AllowAny])
def download_sample_csv(request):

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="sample_candidates.csv"'

    writer = csv.writer(response)

    writer.writerow([
        "full_name",
        "email",
        "phone",
        "designation",
        "department",
        "salary",
        "joining_date",
        "status"
    ])

    writer.writerow([
        "John Doe",
        "john@example.com",
        "03001234567",
        "Software Engineer",
        "IT",
        "120000",
        "2026-08-15",
        "Pending"
    ])

    writer.writerow([
        "Jane Smith",
        "jane@example.com",
        "03111222333",
        "Frontend Developer",
        "IT",
        "100000",
        "2026-08-20",
        "Selected"
    ])

    writer.writerow([
        "Ali Khan",
        "ali@example.com",
        "03211234567",
        "Backend Developer",
        "Engineering",
        "110000",
        "2026-08-25",
        "Interview"
    ])

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_applicants_csv(request):

    csv_file = request.FILES.get("file")

    if not csv_file:
        return Response(
            {"error": "CSV file is required"},
            status=400
        )

    decoded = csv_file.read().decode("utf-8").splitlines()
    reader = csv.DictReader(decoded)

    valid_statuses = [
        "Pending",
        "Interview",
        "Selected",
        "Rejected",
    ]

    count = 0

    for row in reader:

        status = (row.get("status") or "Pending").strip().title()

        if status not in valid_statuses:
            status = "Pending"

        Applicant.objects.create(
            company=request.user.company,
            full_name=row.get("full_name", "").strip(),
            email=row.get("email", "").strip(),
            phone=row.get("phone", "").strip(),
            designation=row.get("designation", "").strip(),
            department=row.get("department", "").strip(),
            salary=Decimal(row.get("salary") or 0),
            joining_date=parse_date(row.get("joining_date")),
            status=status,
        )

        count += 1

    return Response({
        "message": f"{count} candidates uploaded successfully."
    })

def parse_date(date_str):
    if not date_str:
        return None

    date_str = date_str.strip()

    formats = [
        "%Y-%m-%d",   # 2026-08-01
        "%m/%d/%Y",   # 8/1/2026
        "%d/%m/%Y",   # 01/08/2026
        "%d-%m-%Y",   # 01-08-2026
        "%m-%d-%Y",   # 08-01-2026
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    return None

def employee_login(request):
    if request.user.is_authenticated:
        if request.user.role == User.ROLE_EMPLOYEE:
            return redirect("dashboard:employee")
        return redirect("dashboard:index")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user and user.role == User.ROLE_EMPLOYEE:
            login(request, user)
            return redirect("employee_dashboard")

        messages.error(request, "Invalid username or password.")

    return render(request, "employee/login.html")

# ---------- Employees ----------

@login_required
@role_required(
    User.ROLE_OWNER,
    User.ROLE_HR,
)
def employee_list(request):

    employees = (
        Employee.objects
        .filter(
            company=request.user.company,
            user__role=User.ROLE_EMPLOYEE
        )
        .select_related("user")
    )

    return render(
        request,
        "hr/employee_list.html",
        {
            "employees": employees,
        },
    )

@login_required
@role_required(
    User.ROLE_OWNER,
    User.ROLE_HR,
)
def employee_add(request):
    company = request.user.company
    current_users = User.objects.filter(
        company=company,
        is_active=True
    ).exclude(role=User.ROLE_OWNER).count()

    if current_users >= company.seats:
        return Response(
            {
                "error": "Your seat limit has been reached. Please upgrade your plan."
            },
            status=400
        )

    form = EmployeeCreateForm(
        request.POST or None
    )

    if request.method == "POST" and form.is_valid():

        employee_user = form.save(
            company=request.user.company
        )
        employee = Employee.objects.get(user=employee_user)

        manager_id = request.data.get("manager")

        if manager_id:
            try:
                manager = User.objects.get(
                    id=manager_id,
                    company=request.user.company,
                    role=User.ROLE_MANAGER,
                )

                employee.manager = manager
                employee.save(update_fields=["manager"])

            except User.DoesNotExist:
                return Response(
                    {"manager": ["Invalid manager selected."]},
                    status=400,
                )
        general = Conversation.objects.filter(
            company=request.user.company,
            conversation_type=Conversation.GENERAL
        ).first()

        announcement = Conversation.objects.filter(
            company=request.user.company,
            conversation_type=Conversation.ANNOUNCEMENT
        ).first()

        if general:
            ConversationMember.objects.get_or_create(
                conversation=general,
                user=employee_user,
            )

        if announcement:
            ConversationMember.objects.get_or_create(
                conversation=announcement,
                user=employee_user,
            )

        employee = Employee.objects.get(
            user=employee_user
        )

        manager_id = request.data.get("manager")

        if manager_id:
            manager = User.objects.get(
                id=manager_id,
                company=request.user.company,
                role=User.ROLE_MANAGER
            )

            employee.manager = manager
            employee.save()
        messages.success(
            request,
            f"{employee_user.get_full_name()} has been added successfully."
        )

        return redirect("hr:employee-list")

    return render(
        request,
        "hr/employee_form.html",
        {
            "form": form,
        },
    )
# ---------- Attendance ----------
# ---------- Employee Add / Remove (API) ----------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_employee(request):
    company = request.user.company
    current_users = User.objects.filter(
        company=company,
        is_active=True
    ).exclude(role=User.ROLE_OWNER).count()

    if current_users >= company.seats:
        return Response(
            {
                "error": "Your seat limit has been reached. Please upgrade your plan."
            },
            status=400
        )
    if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    form = EmployeeCreateForm(request.data)
    if not form.is_valid():
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    employee_user = form.save(company=request.user.company)
    employee = Employee.objects.get(user=employee_user)

    manager_id = request.data.get("manager")

    if manager_id:
        try:
            manager = User.objects.get(
                id=manager_id,
                company=request.user.company,
                role=User.ROLE_MANAGER,
            )

            employee.manager = manager
            employee.save(update_fields=["manager"])

        except User.DoesNotExist:
            return Response(
                {"manager": ["Invalid manager selected."]},
                status=400,
            )
    general = Conversation.objects.filter(
        company=request.user.company,
        conversation_type=Conversation.GENERAL
    ).first()

    announcement = Conversation.objects.filter(
        company=request.user.company,
        conversation_type=Conversation.ANNOUNCEMENT
    ).first()

    if general:
        ConversationMember.objects.get_or_create(
            conversation=general,
            user=employee_user,
        )

    if announcement:
        ConversationMember.objects.get_or_create(
            conversation=announcement,
            user=employee_user,
        )

    return Response({
        "message": "Employee added successfully",
        "id": employee_user.id,
        "name": employee_user.get_full_name(),
        "email": employee_user.email,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employee_list_api(request):
    if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    employees = (
        Employee.objects
        .filter(company=request.user.company, user__role=User.ROLE_EMPLOYEE, user__is_active=True)
        .select_related("user","manager")
    )

    data = [
        {
            "id": emp.id,
            "name": emp.user.get_full_name(),
            "username": emp.user.username,
            "email": emp.user.email,
            "designation": emp.designation,
            "age": emp.age,
            "manager": (
            emp.manager.get_full_name()
            if emp.manager else "Not Assigned"
        ),
        }
        for emp in employees
    ]
    return Response(data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_employee(request, employee_id):
    if request.user.role not in [User.ROLE_OWNER, User.ROLE_HR]:
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    employee = get_object_or_404(Employee, id=employee_id, company=request.user.company)
    name = employee.user.get_full_name() or employee.user.username
    employee.user.delete()

    return Response({"message": f"{name} has been permanently deleted."})


@login_required
def clock_in_out(request):
    """One button that toggles: clock in if no open record today, else
    clock out. Captures GPS (from the browser) and IP on each action, and
    blocks the action if the company restricts attendance to certain IPs."""
    employee = get_object_or_404(Employee, user=request.user)
    today = timezone.localdate()
    record, _ = Attendance.objects.get_or_create(
        employee=employee, date=today, defaults={'company': employee.company}
    )

    if request.method == 'POST':
        client_ip = get_client_ip(request)
        if not ip_allowed(employee.company, client_ip):
            messages.error(
                request,
                f"Attendance isn't allowed from this network ({client_ip}). "
                "Ask your admin to whitelist it."
            )
            return redirect('hr:attendance-today')

        latitude = request.POST.get('latitude') or None
        longitude = request.POST.get('longitude') or None

        if not record.clock_in:
            record.clock_in = timezone.now()
            record.clock_in_ip = client_ip
            record.clock_in_latitude = latitude
            record.clock_in_longitude = longitude
            messages.success(request, 'Clocked in.')
        elif not record.clock_out:
            if record.is_on_break:
                messages.error(request, 'End your current break before clocking out.')
                return redirect('hr:attendance-today')
            record.clock_out = timezone.now()
            record.clock_out_ip = client_ip
            record.clock_out_latitude = latitude
            record.clock_out_longitude = longitude
            messages.success(request, 'Clocked out.')
        else:
            messages.info(request, "You've already clocked out for today.")
        record.save()
        return redirect('hr:attendance-today')

    return render(request, 'hr/attendance_today.html', {'record': record})


@login_required
def break_toggle(request):
    """One button that toggles: start a break if none is open, else end
    the currently-open break. Multiple breaks per day are supported."""
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])

    employee = get_object_or_404(Employee, user=request.user)
    today = timezone.localdate()
    record = get_object_or_404(Attendance, employee=employee, date=today)

    if not record.clock_in or record.clock_out:
        messages.error(request, 'You must be clocked in (and not yet clocked out) to take a break.')
        return redirect('hr:attendance-today')

    open_break = record.breaks.filter(break_end__isnull=True).order_by('-break_start').first()
    if open_break:
        open_break.break_end = timezone.now()
        open_break.save()
        messages.success(request, 'Break ended.')
    else:
        record.breaks.create(break_start=timezone.now())
        messages.success(request, 'Break started.')
    return redirect('hr:attendance-today')


@login_required
def attendance_list(request):
    """Owner/Manager see the whole company's attendance; Employees see
    only their own history."""
    records = (
        Attendance.objects
        .filter(company=request.user.company)
        .select_related("employee", "employee__user")
    )
    if not request.user.is_manager_level():
        records = records.filter(employee__user=request.user)
    return render(request, 'hr/attendance_list.html', {'records': records[:100]})


# ---------- Tasks ----------

def _visible_tasks(request):
    tasks = Task.objects.filter(company=request.user.company)
    if not request.user.is_manager_level():
        tasks = tasks.filter(assigned_to=request.user)
    return tasks


@login_required
def task_list(request):
    return render(request, 'hr/task_list.html', {'tasks': _visible_tasks(request)})


@login_required
def task_add(request):
    form = TaskForm(request.POST or None, company=request.user.company)
    if request.method == 'POST' and form.is_valid():
        task = form.save(commit=False)
        task.company = request.user.company
        task.created_by = request.user
        task.save()
        messages.success(request, 'Task created.')
        return redirect('hr:task-list')
    return render(request, 'hr/task_form.html', {'form': form})


@login_required
def task_edit(request, pk):
    task = get_object_or_404(Task, pk=pk, company=request.user.company)
    if not request.user.is_manager_level() and task.assigned_to_id != request.user.id:
        raise PermissionDenied('You can only edit tasks assigned to you.')

    form = TaskForm(request.POST or None, instance=task, company=request.user.company)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Task updated.')
        return redirect('hr:task-list')
    return render(request, 'hr/task_form.html', {'form': form})


@login_required
@role_required(User.ROLE_EMPLOYEE)
def employee_attendance(request):
    employee = get_object_or_404(Employee, user=request.user)
    attendance, _ = Attendance.objects.get_or_create(
        employee=employee,
        company=employee.company,
        date=timezone.localdate()
    )
    if request.method == "POST":
        action = request.POST.get("action")
        ip = get_client_ip(request)
        if not ip_allowed(employee.company, ip):
            messages.error(
                request,
                "Attendance not allowed from this network"
            )
            return redirect("hr:employee-attendance")
        latitude = _parse_coord(
            request.POST.get("latitude")
        )
        longitude = _parse_coord(
            request.POST.get("longitude")
        )
        if action == "clock_in":
            if not attendance.clock_in:
                if employee.home_latitude and latitude and longitude:
                    distance = calculate_distance(
                        employee.home_latitude,
                        employee.home_longitude,
                        latitude,
                        longitude
                    )
                    if distance > employee.location_radius:
                        messages.error(
                            request,
                            f"Outside attendance location ({round(distance)} meters)"
                        )
                        return redirect(
                            "hr:employee-attendance"
                        )
                attendance.clock_in = timezone.now()
                attendance.clock_in_ip = ip
                attendance.clock_in_latitude = latitude
                attendance.clock_in_longitude = longitude
                messages.success(
                    request,
                    "Clock In Successful"
                )
        elif action == "clock_out":
            attendance.clock_out = timezone.now()
            attendance.clock_out_ip = ip
            attendance.clock_out_latitude = latitude
            attendance.clock_out_longitude = longitude
            messages.success(
                request,
                "Clock Out Successful"
            )
        attendance.save()
        return redirect(
            "hr:employee-attendance"
        )
    return render(
        request,
        "employee/attendance.html",
        {
            "attendance": attendance
        }
    )
class SetAttendanceLocationAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsEmployee
    ]
    def post(self, request):
        employee = request.user.employee_profile
        if employee.home_latitude:
            return Response(
                {
                    "error": "Attendance location already set"
                },
                status=400
            )
        employee.home_latitude = request.data.get(
            "latitude"
        )
        employee.home_longitude = request.data.get(
            "longitude"
        )
        employee.save()
        return Response(
            {
                "message":
                "Attendance location saved"
            }
        )

@login_required
@role_required(User.ROLE_EMPLOYEE)
def employee_break(request):

    employee = get_object_or_404(
        Employee,
        user=request.user
    )


    attendance = Attendance.objects.get(
        employee=employee,
        date=timezone.localdate()
    )


    active_break = attendance.breaks.filter(
        break_end__isnull=True
    ).first()



    if active_break:

        active_break.break_end = timezone.now()

        active_break.save()

        messages.success(
            request,
            "Break ended"
        )


    else:

        attendance.breaks.create(
            break_start=timezone.now()
        )


        messages.success(
            request,
            "Break started"
        )


    return redirect(
        "hr:employee-attendance"
    )

@login_required
@role_required(User.ROLE_EMPLOYEE)
def my_tasks(request):

    tasks = Task.objects.filter(
        assigned_to=request.user
    )


    return render(
        request,
        "employee/tasks.html",
        {
            "tasks":tasks
        }
    )
class EmployeeTaskListAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsEmployee
    ]
    def get(self, request):
        tasks = Task.objects.filter(
            assigned_to=request.user
        ).order_by("-id")
        data = []
        for task in tasks:
            data.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "priority": task.get_priority_display(),
                "status": task.get_status_display(),
                "due_date":
                    task.due_date.strftime("%Y-%m-%d")
                    if task.due_date else ""

            })


        return Response(data)

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def offer_letters(request):
    if request.method=="GET":
        letters = OfferLetter.objects.filter(
            company=request.user.company
        ).order_by("-created_at")

        serializer = OfferLetterSerializer(
            letters,
            many=True
        )
        return Response(serializer.data)
    if request.method=="POST":
        data=request.data.copy()
        data["company"]=request.user.company.id
        data["created_by"]=request.user.id
        serializer=OfferLetterSerializer(
            data=data
        )
        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message":"Offer letter created",
                    "data":serializer.data
                },
                status=201
            )
        return Response(
            serializer.errors,
            status=400
        )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_offer(request):

    applicant = get_object_or_404(
        Applicant,
        id=request.data.get("applicant_id"),
        company=request.user.company,
    )

    offer = OfferLetter.objects.create(
        company=request.user.company,
        candidate_name=applicant.full_name,
        email=applicant.email,
        designation=request.data.get("designation"),
        salary=request.data.get("salary"),
        joining_date=request.data.get("joining_date"),
        employment_type="Full Time",
        status="Generated",
        created_by=request.user,
    )

    company = request.user.company

    company_name = company.name
    company_phone = getattr(company, "phone", "") or "+92 XXX XXXXXXX"
    company_email = getattr(company, "email", "") or "hr@company.com"
    company_address = getattr(company, "address", "") or "Company Address"

    department = (
        getattr(applicant, "department", None)
        or request.data.get("department")
        or "Information Technology"
    )

    html_message = f"""
    <!DOCTYPE html>
    <html>

    <body style="margin:0;padding:40px;background:#f3f4f6;font-family:Arial,sans-serif;">

        <table align="center" width="700"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
               box-shadow:0 2px 10px rgba(0,0,0,.1);border-collapse:collapse;">

            <tr>
                <td style="background:#0F172A;color:#fff;padding:30px;text-align:center;">

                    <h1 style="margin:0;">
                        {company_name}
                    </h1>

                    <p style="margin:8px 0 0;">
                        Official Employment Offer
                    </p>

                </td>
            </tr>

            <tr>

                <td style="padding:40px;">

                    <p>
                        Dear
                        <strong>{applicant.full_name}</strong>,
                    </p>

                    <p>
                        Congratulations!
                    </p>

                    <p>
                        We are delighted to offer you employment with
                        <strong>{company_name}</strong>.
                        After carefully reviewing your application and interview,
                        we are pleased to offer you the position mentioned below.
                    </p>

                    <table width="100%"
                           cellpadding="10"
                           style="margin-top:25px;border-collapse:collapse;">

                        <tr style="background:#f8fafc;">
                            <td width="220">
                                <strong>Company</strong>
                            </td>

                            <td>
                                {company_name}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Department</strong>
                            </td>

                            <td>
                                {department}
                            </td>
                        </tr>

                        <tr style="background:#f8fafc;">
                            <td>
                                <strong>Designation</strong>
                            </td>

                            <td>
                                {offer.designation}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Employment Type</strong>
                            </td>

                            <td>
                                {offer.employment_type}
                            </td>
                        </tr>

                        <tr style="background:#f8fafc;">
                            <td>
                                <strong>Salary</strong>
                            </td>

                            <td>
                                {offer.salary}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>Joining Date</strong>
                            </td>

                            <td>
                                {offer.joining_date}
                            </td>
                        </tr>

                    </table>

                    <p style="margin-top:30px;line-height:28px;">

                        We believe your knowledge, skills and experience
                        will make a valuable contribution to our organization.

                        We are excited to welcome you to our team and look
                        forward to building a successful future together.

                    </p>

                    <p>

                        Please confirm your acceptance of this offer
                        by replying to this email before your joining date.

                    </p>

                    <hr style="margin:35px 0;">

                    <h3 style="margin-bottom:15px;">
                        HR Contact Information
                    </h3>

                    <table width="100%"
                           cellpadding="8"
                           style="border-collapse:collapse;">

                        <tr style="background:#f8fafc;">
                            <td width="180">
                                <strong>Company</strong>
                            </td>

                            <td>
                                {company_name}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <strong>HR Email</strong>
                            </td>

                            <td>
                                {company_email}
                            </td>
                        </tr>

                        <tr style="background:#f8fafc;">
                            <td>
                                <strong>Phone</strong>
                            </td>

                            <td>
                                {company_phone}
                            </td>
                        </tr>

                        <tr style="background:#f8fafc;">
                            <td>
                                <strong>Office Address</strong>
                            </td>

                            <td>
                                {company_address}
                            </td>
                        </tr>

                    </table>

                    <p style="margin-top:35px;">

                        If you have any questions regarding your employment,
                        salary, joining process or company policies, please
                        contact our HR Department using the details above.

                    </p>

                    <br>

                    <p>

                        Kind Regards,

                        <br><br>

                        <strong>Human Resources Department</strong>

                        <br>

                        {company_name}

                    </p>

                </td>

            </tr>

            <tr>

                <td style="background:#0F172A;color:#fff;
                           text-align:center;padding:18px;font-size:13px;">

                    © 2026 {company_name}. All Rights Reserved.

                </td>

            </tr>

        </table>

    </body>

    </html>
    """

    text_message = strip_tags(html_message)

    # Company ki connected Gmail mailbox se bhejne ki koshish karo
    try:
        mailbox = get_mailbox(company)

        send_html_email(
            mailbox=mailbox,
            to_email=applicant.email,
            subject=f"Offer Letter | {company_name}",
            text_body=text_message,
            html_body=html_message,
        )

    except Mailbox.DoesNotExist:
        # Company ne Gmail connect nahi ki — default SMTP se fallback
        email = EmailMultiAlternatives(
            subject=f"Offer Letter | {company_name}",
            body=text_message,
            from_email=f"{company_name} HR <{company_email}>",
            to=[applicant.email],
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)

    offer.status = "Sent"
    offer.save(update_fields=["status"])

    return Response({
        "success": True,
        "message": "Offer letter generated and sent successfully."
    })

class CreateAnnouncementAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsHR
    ]
    def post(self, request):
        serializer = AnnouncementSerializer(
            data=request.data
        )
        if serializer.is_valid():
            serializer.save(
                company=request.user.company,
                created_by=request.user
            )
            return Response({
                "message":"Announcement created successfully."
            })
        return Response(
            serializer.errors,
            status=400
        )
class EmployeeAnnouncementAPIView(APIView):

    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):

        employee = request.user.employee_profile

        announcements = Notification.objects.filter(
            employee=employee,
            notification_type="Announcement"
        ).select_related(
            "company",
            "manager"
        ).order_by("-created_at")

        data = []

        for item in announcements:
            data.append({
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "company_name": item.company.name,
                "created_by_name": item.manager.get_full_name() if item.manager else "",
                "created_at": item.created_at,
            })

        return Response(data)

class OwnerAnnouncementAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOwner
    ]

    def post(self, request):

        title = request.data.get("title")
        message = request.data.get("message")

        employees = Employee.objects.filter(
            company=request.user.company,
            user__role__in=[
                User.ROLE_MANAGER,
                User.ROLE_EMPLOYEE,
                User.ROLE_HR,
            ]
        )

        notifications = []

        for employee in employees:

            notifications.append(
                Notification(
                    company=request.user.company,
                    employee=employee,
                    manager=request.user,
                    title=title,
                    message=message,
                    notification_type="Announcement"
                )
            )

        Notification.objects.bulk_create(notifications)

        return Response({
            "message": "Announcement sent successfully."
        })

class ManagerAnnouncementAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsManager
    ]

    def get(self, request):

        employee = request.user.employee_profile

        announcements = Notification.objects.filter(
            employee=employee,
            notification_type="Announcement"
        ).select_related(
            "company",
            "manager"
        ).order_by("-created_at")

        data = []

        for item in announcements:
            data.append({
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "company_name": item.company.name,
                "created_by_name": item.manager.get_full_name() if item.manager else "",
                "created_at": item.created_at,
            })

        return Response(data)

class HRAnnouncementAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsHR
    ]

    def get(self, request):

        employee = request.user.employee_profile

        announcements = Notification.objects.filter(
            employee=employee,
            notification_type="Announcement"
        ).select_related(
            "company",
            "manager"
        ).order_by("-created_at")

        data = []

        for item in announcements:

            data.append({
                "id": item.id,
                "title": item.title,
                "message": item.message,
                "company_name": item.company.name,
                "created_by_name": item.manager.get_full_name() if item.manager else "",
                "created_at": item.created_at,
            })

        return Response(data)

# owner create task for these

class OwnerCreateTaskAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def post(self, request):

        user = request.user


        # Only Owner can create task
        if user.role != User.ROLE_OWNER:

            return Response(
                {
                    "error": "Only owner can create tasks"
                },
                status=status.HTTP_403_FORBIDDEN
            )


        data = request.data.copy()


        assigned_user_id = data.get("assigned_to")


        if not assigned_user_id:

            return Response(
                {
                    "error":"Please select user"
                },
                status=400
            )


        try:

            assigned_user = User.objects.get(
                id=assigned_user_id,
                company=user.company
            )

        except User.DoesNotExist:

            return Response(
                {
                    "error":"User not found"
                },
                status=404
            )


        # Owner can assign only HR or Manager

        if assigned_user.role not in [
            User.ROLE_MANAGER,
            User.ROLE_HR
        ]:

            return Response(
                {
                    "error":"Owner can assign task only to Manager or HR"
                },
                status=403
            )


        serializer = TaskSerializer(
            data=data
        )


        if serializer.is_valid():

            task = serializer.save(

                company=user.company,

                created_by=user,

                assigned_to=assigned_user

            )
            print(serializer.errors)
            return Response(
                {
                    "message":"Task assigned successfully",
                    "task":TaskSerializer(task).data
                },
                status=201
            )


        return Response(
            serializer.errors,
            status=400
        )

class TaskCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data.copy()
        serializer = TaskSerializer(
            data=data
        )
        if serializer.is_valid():
            task = serializer.save(
                company=request.user.company,
                created_by=request.user
            )
            return Response(
                {
                    "message":"Task created successfully",
                    "task":TaskSerializer(task).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class OwnerTaskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != User.ROLE_OWNER:
            return Response(
                {"error": "Permission denied"},
                status=403
            )

        tasks = Task.objects.filter(
            company=request.user.company
        ).select_related(
            "assigned_to",
            "created_by",
            "assigned_to__employee_profile",
            "assigned_to__employee_profile__manager",
        ).order_by("-created_at")

        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data)
class ManagerTaskAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != User.ROLE_MANAGER:
            return Response(
                {"error": "Permission denied"},
                status=403
            )

        tasks = Task.objects.filter(
            assigned_to=request.user,
            created_by__role=User.ROLE_OWNER
        ).order_by("-created_at")


        serializer = TaskSerializer(
            tasks,
            many=True
        )

        return Response(serializer.data)

class HRTaskAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role != User.ROLE_HR:
            return Response(
                {"error":"Permission denied"},
                status=403
            )
        tasks = Task.objects.filter(
            assigned_to=request.user
        )
        serializer = TaskSerializer(
            tasks,
            many=True
        )
        return Response(serializer.data)
class EmployeeTaskAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def get(self, request):

        if request.user.role != User.ROLE_EMPLOYEE:
            return Response(
                {"error":"Permission denied"},
                status=403
            )


        tasks = Task.objects.filter(
            assigned_to=request.user
        )


        serializer = TaskSerializer(
            tasks,
            many=True
        )


        return Response(serializer.data)

class OwnerTaskUsersAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        role = request.GET.get("role")

        company = request.user.company


        # Managers
        if role == "manager":

            users = User.objects.filter(
                company=company,
                role=User.ROLE_MANAGER
            )


        # HR
        elif role == "hr":

            users = User.objects.filter(
                company=company,
                role=User.ROLE_HR
            )


        # Employees under selected manager
        elif role == "employee":

            manager_id = request.GET.get("manager_id")

            users = User.objects.filter(
                company=company,
                role=User.ROLE_EMPLOYEE,
                employee_profile__manager_id=manager_id
            )


        else:
            return Response([])



        data=[]

        for user in users:

            data.append({
                "id":user.id,
                "name":user.get_full_name() or user.username
            })


        return Response(data)

class TaskUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            task = Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=404)

        if task.assigned_to != request.user:
            return Response({"error": "Permission denied"}, status=403)

        task.status = request.data.get("status", task.status)
        task.completion = request.data.get(
            "completion",
            task.completion
        )

        task.save()

        return Response(TaskSerializer(task).data)

# now owner can see attendance


#------------------------


