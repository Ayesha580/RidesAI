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

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='follow_ups')
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_at = models.DateTimeField()
    message = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lead.full_name} - {self.activity_type} @ {self.scheduled_at}"