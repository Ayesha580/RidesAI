from django.conf import settings
from django.db import models
from django.utils import timezone

from companies.models import Company
from accounts.models import User

from django.db import models


class Application(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Selected", "Selected"),
        ("Rejected", "Rejected"),
    )

    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    salary = models.CharField(max_length=50)
    joining_date = models.DateField(null=True, blank=True)
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class Employee(models.Model):
    custom_role = models.CharField(max_length=100, blank=True, null=True)
    home_latitude = models.FloatField(
        null=True,
        blank=True
    )

    home_longitude = models.FloatField(
        null=True,
        blank=True
    )

    location_radius = models.IntegerField(
        default=100,
        help_text="Allowed distance in meters"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    cnic = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    blood_group = models.CharField(
        max_length=10,
        blank=True,
        null=True,
    )

    marital_status = models.CharField(
        max_length=20,
        choices=[
            ("Single", "Single"),
            ("Married", "Married"),
        ],
        blank=True,
        null=True,
    )

    nationality = models.CharField(
        max_length=50,
        blank=True,
        default="Pakistan",
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
    )

    age = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_employees",
    )

    employee_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )

    photo = models.ImageField(
        upload_to="employees/",
        blank=True,
        null=True,
    )

    designation = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    joining_date = models.DateField(
        blank=True,
        null=True,
    )

    employment_type = models.CharField(
        max_length=50,
        choices=[
            ("Full Time", "Full Time"),
            ("Part Time", "Part Time"),
            ("Intern", "Intern"),
            ("Contract", "Contract"),
        ],
        default="Full Time",
    )

    salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
        ("Resigned", "Resigned"),
        ("Terminated", "Terminated"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Active",
    )

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
    )

    dob = models.DateField(
        blank=True,
        null=True,
    )

    address = models.TextField(
        blank=True,
        null=True,
    )

    emergency_contact = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    emergency_phone = models.CharField(
        max_length=30,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.user.get_full_name() or self.user.username

class Task(models.Model):
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
    ]

    STATUS_TODO = 'todo'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = [
        (STATUS_TODO, 'To Do'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='created_tasks'
    )
    completion = models.PositiveIntegerField(
        default=0
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_TODO)
    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class TaskComment(models.Model):
    task = models.ForeignKey(
        "Task",
        on_delete=models.CASCADE,
        related_name="comments"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    comment = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class TaskAttachment(models.Model):
    task = models.ForeignKey(
        "Task",
        on_delete=models.CASCADE,
        related_name="attachments"
    )

    file = models.FileField(
        upload_to="task_files/"
    )

    uploaded_at=models.DateTimeField(
        auto_now_add=True
    )

class Team(models.Model):

    company=models.ForeignKey(
        Company,
        on_delete=models.CASCADE
    )

    name=models.CharField(
        max_length=100
    )

    manager=models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

class EmployeeDocument(models.Model):

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    title = models.CharField(
        max_length=100
    )

    file = models.FileField(
        upload_to="employee_documents/"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ("CNIC", "CNIC"),
            ("Contract", "Contract"),
            ("Certificate", "Certificate"),
            ("Resume", "Resume"),
            ("Offer Letter", "Offer Letter"),
            ("Other", "Other"),
        ],
        default="Other"
    )

    def __str__(self):
        return self.title

class Attendance(models.Model):
    """One row per employee per day. Clock-in/out based — no manual
    marking required. Working hours are net of any breaks taken."""

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='attendance_records')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.localdate)

    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)

    # GPS captured from the browser at the moment of clock-in/out
    clock_in_latitude = models.FloatField(null=True, blank=True)
    clock_in_longitude = models.FloatField(null=True, blank=True)
    clock_out_latitude = models.FloatField(null=True, blank=True)
    clock_out_longitude = models.FloatField(null=True, blank=True)
    login_time = models.DateTimeField(
        null=True,
        blank=True
    )

    logout_time = models.DateTimeField(
        null=True,
        blank=True
    )

    device_name = models.CharField(
        max_length=255,
        blank=True
    )

    browser = models.CharField(
        max_length=500,
        blank=True
    )

    os = models.CharField(
        max_length=255,
        blank=True
    )

    login_location = models.CharField(
        max_length=255,
        blank=True
    )

    logout_location = models.CharField(
        max_length=255,
        blank=True
    )

    is_late = models.BooleanField(default=False)

    overtime_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    # IP address captured at clock-in/out, checked against Company.allowed_ip_addresses
    clock_in_ip = models.GenericIPAddressField(null=True, blank=True)
    clock_out_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-date"]
        unique_together = ("employee", "date")
        indexes = [
            models.Index(fields=["company", "date"]),
            models.Index(fields=["employee", "date"]),
        ]

    def __str__(self):
        return f'{self.employee} — {self.date}'

    @property
    def total_break_minutes(self):
        total = timezone.timedelta()
        for b in self.breaks.all():
            if b.break_start and b.break_end:
                total += b.break_end - b.break_start
        return round(total.total_seconds() / 60, 1)

    @property
    def worked_hours(self):
        """Gross clocked time minus total break time."""
        if self.clock_in and self.clock_out:
            gross_minutes = (self.clock_out - self.clock_in).total_seconds() / 60
            net_minutes = gross_minutes - self.total_break_minutes
            return round(max(net_minutes, 0) / 60, 2)
        return None

    @property
    def is_open(self):
        """Clocked in but not yet clocked out today."""
        return bool(self.clock_in and not self.clock_out)

    @property
    def is_on_break(self):
        last = self.breaks.order_by('-break_start').first()
        return bool(last and last.break_start and not last.break_end)


class Break(models.Model):
    """A single break-start/break-end pair within one day's Attendance.
    A day can have multiple breaks (lunch, tea break, etc.)."""

    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='breaks')
    break_start = models.DateTimeField(null=True, blank=True)
    break_end = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-break_start']

    def __str__(self):
        return f'{self.attendance} break'

    @property
    def duration_minutes(self):
        if self.break_start and self.break_end:
            return round((self.break_end - self.break_start).total_seconds() / 60, 1)
        return None


class Applicant(models.Model):

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Selected", "Selected"),
        ("Rejected", "Rejected"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="applicants"
    )

    full_name = models.CharField(max_length=200)

    email = models.EmailField()

    phone = models.CharField(
        max_length=30,
        blank=True
    )

    designation = models.CharField(
        max_length=150
    )

    department = models.CharField(
        max_length=150,
        blank=True
    )

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    joining_date = models.DateField(
        null=True,
        blank=True
    )

    resume = models.FileField(
        upload_to="resumes/",
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.full_name
class OfferLetter(models.Model):
    STATUS_CHOICES = (
        ("Draft","Draft"),
        ("Generated","Generated"),
        ("Sent","Sent"),
    )
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="offer_letters"
    )
    candidate_name = models.CharField(
        max_length=200
    )
    email = models.EmailField()
    designation = models.CharField(
        max_length=150
    )
    department = models.CharField(
        max_length=150,
        blank=True
    )
    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    joining_date = models.DateField()
    employment_type = models.CharField(
        max_length=100,
        default="Full Time"
    )
    probation_period = models.CharField(
        max_length=100,
        blank=True
    )
    pdf = models.FileField(
        upload_to="offer_letters/",
        null=True,
        blank=True
    )
    status=models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Draft"
    )
    created_by=models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at=models.DateTimeField(
        auto_now_add=True
    )
    def __str__(self):
        return self.candidate_name

class Leave(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]

    LEAVE_TYPES = [
        ("Annual", "Annual"),
        ("Sick", "Sick"),
        ("Casual", "Casual"),
        ("Emergency", "Emergency"),
        ("Unpaid", "Unpaid"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    leave_type = models.CharField(
        max_length=30,
        choices=LEAVE_TYPES
    )

    start_date = models.DateField()

    end_date = models.DateField()

    total_days = models.PositiveIntegerField(default=1)

    reason = models.TextField()

    attachment = models.FileField(
        upload_to="leave_documents/",
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )

    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_leaves"
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    hr_comment = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        self.total_days = (
            self.end_date - self.start_date
        ).days + 1
        super().save(*args, **kwargs)

class Notification(models.Model):
    manager = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sent_notifications"
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    manager = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sent_notifications"
    )

    title = models.CharField(max_length=200)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        choices=[
            ("Task","Task"),
            ("Leave","Leave"),
            ("Announcement","Announcement"),
            ("Salary","Salary"),
        ]
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Announcement(models.Model):

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="announcements"
    )

    title = models.CharField(
        max_length=200
    )

    message = models.TextField()

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="announcements"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    def __str__(self):
        return self.title

class Screenshot(models.Model):
    company = models.ForeignKey("companies.Company", on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="screenshots")
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, null=True, blank=True, related_name="screenshots")
    image = models.ImageField(upload_to="screenshots/%Y/%m/%d/")
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-captured_at"]