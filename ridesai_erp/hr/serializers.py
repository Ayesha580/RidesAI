from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, Screenshot
from .models import (
    Application,
    Attendance,
    Break,
    Applicant,
    Employee,
    EmployeeDocument,
    OfferLetter, Leave, Notification, Announcement,
)

User = get_user_model()

class ScreenshotSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Screenshot
        fields = ["id", "employee_name", "image_url", "captured_at"]

    def get_employee_name(self, obj):
        return obj.employee.user.get_full_name() or obj.employee.user.username

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = "__all__"


class BreakSerializer(serializers.ModelSerializer):
    duration_minutes = serializers.ReadOnlyField()

    class Meta:
        model = Break
        fields = [
            "id",
            "break_start",
            "break_end",
            "duration_minutes",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    worked_hours = serializers.ReadOnlyField()
    total_break_minutes = serializers.ReadOnlyField()
    breaks = BreakSerializer(many=True, read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_name",
            "date",

            "clock_in",
            "clock_out",

            "login_time",
            "logout_time",

            "clock_in_ip",
            "clock_out_ip",

            "clock_in_latitude",
            "clock_in_longitude",
            "clock_out_latitude",
            "clock_out_longitude",

            "login_location",
            "logout_location",

            "device_name",
            "browser",
            "os",

            "is_late",
            "overtime_hours",

            "worked_hours",
            "total_break_minutes",

            "is_open",
            "is_on_break",

            "breaks",
        ]

    def get_employee_name(self, obj):
        user = obj.employee.user
        return user.get_full_name() or user.email


class HRListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "username",
            "email",
            "designation",
        ]


class EmployeeProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = Employee
        fields = [
            "photo",
            "first_name",
            "last_name",
            "email",
            "employee_id",
            "phone",
            "cnic",
            "designation",
            "department",
            "manager",
            "joining_date",
            "employment_type",
            "gender",
            "dob",
            "age",
            "blood_group",
            "marital_status",
            "nationality",
            "address",
            "emergency_contact",
            "emergency_phone",
            "status",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        user = instance.user

        user.first_name = user_data.get(
            "first_name",
            user.first_name,
        )
        user.last_name = user_data.get(
            "last_name",
            user.last_name,
        )
        user.save()

        return super().update(instance, validated_data)


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = [
            "id",
            "title",
            "document_type",
            "file",
            "uploaded_at",
        ]


class OfferLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferLetter
        fields = "__all__"


class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = "__all__"
        read_only_fields = [
            "id",
            "company",
            "created_at",
        ]


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Leave
        fields = "__all__"
        read_only_fields = (
            "company",
            "employee",
            "status",
            "approved_by",
            "approved_at",
            "total_days",
        )

    def get_employee_name(self, obj):
        user = obj.employee.user

        if user.get_full_name():
            return user.get_full_name()

        return user.username

class NotificationSerializer(serializers.ModelSerializer):

    company = serializers.CharField(source="company.name", read_only=True)

    manager = serializers.SerializerMethodField()

    employee = serializers.CharField(
        source="employee.user.get_full_name",
        read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "company",
            "manager",
            "employee",
            "is_read",
            "created_at",
        ]

    def get_manager(self, obj):
        if obj.manager:
            return obj.manager.get_full_name() or obj.manager.username
        return ""

class AnnouncementSerializer(serializers.ModelSerializer):

    company_name = serializers.CharField(
        source="company.name",
        read_only=True
    )

    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = "__all__"

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return ""

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    assigned_role = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "status",
            "due_date",
            "completion",
            "assigned_to",
            "assigned_to_name",
            "assigned_role",
            "manager_name",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return ""

    def get_assigned_role(self, obj):
        return obj.assigned_to.role

    def get_manager_name(self, obj):
        if obj.assigned_to.role == User.ROLE_EMPLOYEE:
            profile = getattr(obj.assigned_to, "employee_profile", None)
            if profile and profile.manager:
                return (
                    profile.manager.get_full_name()
                    or profile.manager.username
                )
        return "-"