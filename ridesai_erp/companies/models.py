from django.db import models
from datetime import datetime, time
from zoneinfo import available_timezones

class Plan(models.Model):
    BILLING_MONTHLY = "monthly"
    BILLING_YEARLY = "yearly"
    BILLING_CHOICES = (
        (BILLING_MONTHLY, "Monthly"),
        (BILLING_YEARLY, "Yearly"),
    )

    name = models.CharField(max_length=100)
    billing_cycle = models.CharField(
        max_length=10,
        choices=BILLING_CHOICES,
        default=BILLING_MONTHLY,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    description = models.TextField(
        blank=True
    )
    is_active = models.BooleanField(default=True)
    seats = models.IntegerField(default=1)
    features = models.JSONField(default=list)

    class Meta:
        unique_together = ("name", "billing_cycle")

    def __str__(self):
        return f"{self.name} ({self.billing_cycle}) - ${self.price}"

class Company(models.Model):

    TIMEZONE_CHOICES = sorted(
        [(tz, tz) for tz in available_timezones()],
        key=lambda x: x[0]
    )
    shift_start = models.TimeField(default=time(9, 15))
    shift_end = models.TimeField(default=time(18, 0))
    timezone = models.CharField(
        max_length=50,
        choices=TIMEZONE_CHOICES,
        default="UTC",
    )
    seats = models.PositiveIntegerField(default=1)
    registration_docs = models.FileField(
        upload_to="registration_docs/",
        blank=True,
        null=True
    )
    allowed_ip_addresses = models.TextField(
        blank=True,
        null=True,
        help_text="Comma separated IP addresses allowed for attendance"
    )

    STATUS_PENDING = "pending"
    STATUS_ACTIVE = "active"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = (

        (STATUS_PENDING, "Pending"),

        (STATUS_ACTIVE, "Approved"),

        (STATUS_REJECTED, "Rejected"),

    )

    # ------------------------
    # Business Information
    # ------------------------

    name = models.CharField(
        max_length=255,
        unique=True
    )

    description = models.TextField(blank=True)

    business_type = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    industry = models.CharField(
        max_length=120,
        blank=True,
        default=""
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    address = models.TextField(
        blank=True,
        default=""
    )

    cnic = models.CharField(
        max_length=30,
        blank=True,
        default=""
    )

    cnic_front = models.ImageField(
        upload_to="cnic/front/",
        blank=True,
        null=True
    )

    cnic_back = models.ImageField(
        upload_to="cnic/back/",
        blank=True,
        null=True
    )

    # ------------------------
    # Subscription
    # ------------------------

    plan = models.ForeignKey(

        Plan,

        on_delete=models.SET_NULL,

        null=True,

        blank=True,

    )
    polar_subscription_id = models.CharField(
            max_length=200,
            blank=True,
            default=""
        )

    payment_reference = models.CharField(

        max_length=200,

        blank=True,

    )

    payment_proof = models.FileField(

        upload_to="payments/",

        blank=True,

        null=True,

    )

    # ------------------------
    # Approval
    # ------------------------

    status = models.CharField(

        max_length=20,

        choices=STATUS_CHOICES,

        default=STATUS_PENDING,

    )

    approved_by = models.CharField(

        max_length=120,

        blank=True,

    )

    approved_at = models.DateTimeField(

        blank=True,

        null=True,

    )

    rejection_reason = models.TextField(

        blank=True,

    )

    # ------------------------

    created_at = models.DateTimeField(

        auto_now_add=True,

    )

    updated_at = models.DateTimeField(

        auto_now=True,

    )
    is_registered = models.BooleanField(default=False)

    registration_number = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    tax_number = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    owner_name = models.CharField(
        max_length=200,
        blank=True,
        default=""
    )

    email = models.EmailField(
        blank=True,
        default=""
    )

    phone = models.CharField(
        max_length=30,
        blank=True,
        default=""
    )

    def __str__(self):

        return self.name