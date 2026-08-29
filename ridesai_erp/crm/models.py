from django.conf import settings
from django.db import models

from companies.models import Company


class Lead(models.Model):

    STATUS_NEW = 'new'
    STATUS_CONTACTED = 'contacted'
    STATUS_INTERESTED = 'interested'
    STATUS_NOT_ANSWERING = 'not_answering'
    STATUS_WON = 'won'
    STATUS_LOST = 'lost'

    STATUS_CHOICES = [
        (STATUS_NEW, 'New'),
        (STATUS_CONTACTED, 'Contacted'),
        (STATUS_INTERESTED, 'Interested'),
        (STATUS_NOT_ANSWERING, 'Not Answering'),
        (STATUS_WON, 'Won'),
        (STATUS_LOST, 'Lost'),
    ]

    CLOSED_STATUSES = [STATUS_WON, STATUS_LOST]

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='leads'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='assigned_leads'
    )

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    interest = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)

    # --- Naye fields (AI scoring ke liye) ---
    business_name = models.CharField(max_length=200, blank=True, default="")
    location = models.CharField(max_length=150, blank=True, default="")
    category = models.CharField(max_length=150, blank=True, default="")  # industry
    company_size = models.PositiveIntegerField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    source = models.CharField(max_length=50, default="manual")  # manual / import

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    next_followup_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
        ]

    def __str__(self):
        return self.full_name

    def is_closed(self):
        return self.status in self.CLOSED_STATUSES


class LeadImportLog(models.Model):

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='lead_imports')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )

    file_name = models.CharField(max_length=255)
    total_rows = models.PositiveIntegerField(default=0)
    imported_count = models.PositiveIntegerField(default=0)
    duplicate_count = models.PositiveIntegerField(default=0)
    invalid_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.imported_count} imported"


class FollowUpActivity(models.Model):

    TYPE_CALL = "call"
    TYPE_EMAIL = "email"
    TYPE_WHATSAPP = "whatsapp"
    TYPE_REMINDER = "reminder"

    TYPE_CHOICES = (
        (TYPE_CALL, "Call"),
        (TYPE_EMAIL, "Email"),
        (TYPE_WHATSAPP, "WhatsApp"),
        (TYPE_REMINDER, "Reminder"),
    )

    STATUS_PENDING = "pending"
    STATUS_SENT = "sent"
    STATUS_FAILED = "failed"
    STATUS_DONE = "done"

    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_SENT, "Sent"),
        (STATUS_FAILED, "Failed"),
        (STATUS_DONE, "Done"),
    )

    lead = models.ForeignKey(
        Lead,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="follow_ups"
    )

    client = models.ForeignKey(
        "Client",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="follow_ups"
    )

    deal = models.ForeignKey(
        "Deal",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="follow_ups"
    )
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_at = models.DateTimeField()
    message = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.lead:
            name = self.lead.full_name
        elif self.client:
            name = self.client.full_name
        elif self.deal:
            name = self.deal.title
        else:
            name = "Activity"

        return f"{name} - {self.activity_type} @ {self.scheduled_at}"

class Client(models.Model):

    STATUS_ACTIVE = "active"
    STATUS_INACTIVE = "inactive"
    STATUS_PROSPECT = "prospect"
    STATUS_WON = "won"
    STATUS_LOST = "lost"

    STATUS_CHOICES = [
        (STATUS_PROSPECT, "Prospect"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
        (STATUS_WON, "Won"),
        (STATUS_LOST, "Lost"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="clients"
    )

    lead = models.OneToOneField(
        Lead,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="client"
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_clients"
    )

    full_name = models.CharField(max_length=150)
    business_name = models.CharField(max_length=200, blank=True, default="")
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=150, blank=True)
    category = models.CharField(max_length=150, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PROSPECT
    )

    notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return self.full_name


# =========================
# DEAL
# =========================

class Deal(models.Model):

    STAGE_NEW = "new"
    STAGE_QUALIFICATION = "qualification"
    STAGE_PROPOSAL = "proposal"
    STAGE_NEGOTIATION = "negotiation"
    STAGE_WON = "won"
    STAGE_LOST = "lost"

    STAGE_CHOICES = [
        (STAGE_NEW, "New"),
        (STAGE_QUALIFICATION, "Qualification"),
        (STAGE_PROPOSAL, "Proposal"),
        (STAGE_NEGOTIATION, "Negotiation"),
        (STAGE_WON, "Won"),
        (STAGE_LOST, "Lost"),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="deals"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="deals"
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_deals"
    )

    title = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    currency = models.CharField(
        max_length=10,
        default="USD"
    )

    stage = models.CharField(
        max_length=30,
        choices=STAGE_CHOICES,
        default=STAGE_NEW
    )

    probability = models.PositiveIntegerField(
        default=0
    )

    expected_close_date = models.DateField(
        null=True,
        blank=True
    )

    description = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["stage"]),
            models.Index(fields=["company"]),
        ]

    def __str__(self):
        return self.title


# =========================
# DEAL STAGE HISTORY
# =========================

class DealStageHistory(models.Model):

    deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        related_name="stage_history"
    )

    old_stage = models.CharField(
        max_length=30,
        blank=True,
        default=""
    )

    new_stage = models.CharField(
        max_length=30
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    note = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.deal.title}: {self.old_stage} → {self.new_stage}"

class ClientStatusHistory(models.Model):

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="status_history"
    )

    old_status = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    new_status = models.CharField(
        max_length=20
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    note = models.TextField(
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.client.full_name}: {self.old_status} → {self.new_status}"

# =========================
# CRM ACTIVITY
# =========================

class CRMActivity(models.Model):

    TYPE_CALL = "call"
    TYPE_EMAIL = "email"
    TYPE_MEETING = "meeting"
    TYPE_NOTE = "note"
    TYPE_FOLLOWUP = "followup"
    TYPE_STATUS_CHANGE = "status_change"

    TYPE_CHOICES = [
        (TYPE_CALL, "Call"),
        (TYPE_EMAIL, "Email"),
        (TYPE_MEETING, "Meeting"),
        (TYPE_NOTE, "Note"),
        (TYPE_FOLLOWUP, "Follow-up"),
        (TYPE_STATUS_CHANGE, "Status Change"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="crm_activities"
    )

    lead = models.ForeignKey(
        Lead,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    client = models.ForeignKey(
        Client,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    deal = models.ForeignKey(
        Deal,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="crm_activities"
    )

    activity_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True,
        default=""
    )

    scheduled_at = models.DateTimeField(
        null=True,
        blank=True
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company"]),
            models.Index(fields=["activity_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title


# =========================
# INVOICE
# =========================

class Invoice(models.Model):

    STATUS_DRAFT = "draft"
    STATUS_SENT = "sent"
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_OVERDUE = "overdue"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_SENT, "Sent"),
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="invoices"
    )

    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="invoices"
    )

    deal = models.ForeignKey(
        Deal,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoices"
    )

    invoice_number = models.CharField(
        max_length=50
    )

    issue_date = models.DateField()

    due_date = models.DateField()

    service = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    description = models.TextField(
        blank=True,
        default=""
    )

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=1
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    tax = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    currency = models.CharField(
        max_length=10,
        default="USD"
    )

    payment_method = models.CharField(
        max_length=150,
        blank=True,
        default=""
    )

    payment_terms = models.CharField(
        max_length=255,
        blank=True,
        default=""
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT
    )

    notes = models.TextField(
        blank=True,
        default=""
    )

    pdf_file = models.FileField(
        upload_to="invoices/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = [
            ("company", "invoice_number")
        ]

    def __str__(self):
        return self.invoice_number

    def calculate_total(self):
        self.subtotal = (
            self.quantity * self.unit_price
        )

        self.total = (
            self.subtotal
            + self.tax
            - self.discount
        )

        if self.total < 0:
            self.total = 0

        return self.total

class CustomField(models.Model):

    FIELD_TEXT = "text"
    FIELD_NUMBER = "number"
    FIELD_DATE = "date"
    FIELD_BOOLEAN = "boolean"
    FIELD_SELECT = "select"

    FIELD_TYPES = [
        (FIELD_TEXT, "Text"),
        (FIELD_NUMBER, "Number"),
        (FIELD_DATE, "Date"),
        (FIELD_BOOLEAN, "Boolean"),
        (FIELD_SELECT, "Select"),
    ]

    ENTITY_LEAD = "lead"
    ENTITY_CLIENT = "client"
    ENTITY_DEAL = "deal"

    ENTITY_CHOICES = [
        (ENTITY_LEAD, "Lead"),
        (ENTITY_CLIENT, "Client"),
        (ENTITY_DEAL, "Deal"),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="custom_fields"
    )

    name = models.CharField(
        max_length=100
    )

    key = models.SlugField(
        max_length=100
    )

    field_type = models.CharField(
        max_length=20,
        choices=FIELD_TYPES,
        default=FIELD_TEXT
    )

    entity_type = models.CharField(
        max_length=20,
        choices=ENTITY_CHOICES
    )

    options = models.JSONField(
        default=list,
        blank=True
    )

    required = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = [
            ("company", "key", "entity_type")
        ]

    def __str__(self):
        return self.name


# =========================
# CUSTOM FIELD VALUE
# =========================

class CustomFieldValue(models.Model):

    field = models.ForeignKey(
        CustomField,
        on_delete=models.CASCADE,
        related_name="values"
    )

    lead = models.ForeignKey(
        Lead,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="custom_values"
    )

    client = models.ForeignKey(
        Client,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="custom_values"
    )

    deal = models.ForeignKey(
        Deal,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="custom_values"
    )

    value = models.TextField(
        blank=True,
        default=""
    )

    class Meta:
        unique_together = [
            ("field", "lead"),
            ("field", "client"),
            ("field", "deal"),
        ]

    def __str__(self):
        return f"{self.field.name}: {self.value}"
