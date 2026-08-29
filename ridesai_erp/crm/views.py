from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from accounts.permissions import IsOwner
from .models import Lead, LeadImportLog
from .serializers import LeadSerializer
from .utils import read_leads_file, detect_columns, is_valid_row
from .scoring import calculate_lead_score
from .followups import create_followups_for_lead
from rest_framework.pagination import PageNumberPagination
from integrations.models import Mailbox
from rest_framework.views import APIView
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

import pandas as pd

from accounts.permissions import IsOwner

from .models import (
    Lead,
    LeadImportLog,
    Client,
    Deal,
    DealStageHistory,
    ClientStatusHistory,
    CRMActivity,
    Invoice,
    CustomField,
    CustomFieldValue,
)
from django.db.models import Sum, Count
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone


from .serializers import (
    LeadSerializer,
    ClientSerializer,
    DealSerializer,
    CRMActivitySerializer,
InvoiceSerializer,
CustomFieldSerializer,
CustomFieldValueSerializer

)

from .utils import read_leads_file, detect_columns, is_valid_row
from .scoring import calculate_lead_score
from .followups import create_followups_for_lead

from integrations.models import Mailbox
import csv
import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)
from decimal import Decimal

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.http import HttpResponse
from django.template.loader import render_to_string


class LeadPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class CRMPagePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100



class LeadListCreateAPIView(ListCreateAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    pagination_class = LeadPagination

    def get_queryset(self):

        queryset = Lead.objects.filter(
            company=self.request.user.company
        )

        search = self.request.query_params.get(
            "search"
        )

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(business_name__icontains=search) |
                Q(location__icontains=search) |
                Q(category__icontains=search)
            )

        lead_status = self.request.query_params.get(
            "status"
        )

        if lead_status:
            queryset = queryset.filter(
                status=lead_status
            )

        source = self.request.query_params.get(
            "source"
        )

        if source:
            queryset = queryset.filter(
                source=source
            )

        assigned_to = self.request.query_params.get(
            "assigned_to"
        )

        if assigned_to:
            queryset = queryset.filter(
                assigned_to_id=assigned_to
            )

        category = self.request.query_params.get(
            "category"
        )

        if category:
            queryset = queryset.filter(
                category__icontains=category
            )

        return queryset

    def perform_create(self, serializer):

        lead = serializer.save(
            company=self.request.user.company,
            source="manual",
        )

        lead.score = calculate_lead_score(lead)

        lead.save(
            update_fields=["score"]
        )

        create_followups_for_lead(lead)


class LeadDetailAPIView(RetrieveUpdateDestroyAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer

    def get_queryset(self):
        return Lead.objects.filter(
            company=self.request.user.company
        )

    def perform_update(self, serializer):

        lead = serializer.save()

        lead.score = calculate_lead_score(lead)

        lead.save(
            update_fields=["score"]
        )


class LeadImportAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsOwner
    ]

    parser_classes = [MultiPartParser]

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file uploaded."},
                status=400
            )

        company = request.user.company

        try:

            df = read_leads_file(file)

        except Exception as e:

            return Response(
                {
                    "error": f"Could not read file: {str(e)}"
                },
                status=400
            )

        column_map = detect_columns(df)

        if "full_name" not in column_map:

            return Response(
                {
                    "error":
                    "Could not detect a 'name' column in the file."
                },
                status=400
            )

        total_rows = len(df)

        imported = 0
        duplicates = 0
        invalid = 0

        for _, row in df.iterrows():

            row_data = {
                field: (
                    str(row[col]).strip()
                    if col in row and pd.notna(row[col])
                    else ""
                )
                for field, col in column_map.items()
            }

            if not is_valid_row(row_data):

                invalid += 1
                continue

            email = row_data.get("email", "")
            phone = row_data.get("phone", "")

            existing = Lead.objects.filter(
                company=company
            )

            if email:

                existing = existing.filter(
                    email=email
                )

            elif phone:

                existing = existing.filter(
                    phone=phone
                )

            else:

                existing = existing.none()

            if existing.exists():

                duplicates += 1
                continue

            company_size = None

            if row_data.get("company_size"):

                try:

                    company_size = int(
                        float(
                            row_data["company_size"]
                        )
                    )

                except ValueError:

                    company_size = None

            lead = Lead.objects.create(

                company=company,

                full_name=row_data.get(
                    "full_name",
                    ""
                ),

                email=email,

                phone=phone,

                business_name=row_data.get(
                    "business_name",
                    ""
                ),

                location=row_data.get(
                    "location",
                    ""
                ),

                category=row_data.get(
                    "category",
                    ""
                ),

                company_size=company_size,

                source="import",
            )

            lead.score = calculate_lead_score(
                lead
            )

            lead.save(
                update_fields=["score"]
            )

            create_followups_for_lead(
                lead
            )

            imported += 1

        LeadImportLog.objects.create(

            company=company,

            uploaded_by=request.user,

            file_name=file.name,

            total_rows=total_rows,

            imported_count=imported,

            duplicate_count=duplicates,

            invalid_count=invalid,
        )

        mailbox_connected = Mailbox.objects.filter(
            company=company,
            connected=True
        ).exists()

        return Response(

            {
                "total_rows": total_rows,
                "imported": imported,
                "duplicates": duplicates,
                "invalid": invalid,
                "mailbox_connected": mailbox_connected,
            },

            status=status.HTTP_201_CREATED
        )

class ClientListCreateAPIView(ListCreateAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer
    pagination_class = CRMPagePagination

    def get_queryset(self):

        queryset = Client.objects.filter(
            company=self.request.user.company
        ).select_related(
            "lead",
            "assigned_to"
        )

        search = self.request.query_params.get(
            "search"
        )

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(business_name__icontains=search) |
                Q(location__icontains=search)
            )

        client_status = self.request.query_params.get(
            "status"
        )

        if client_status:
            queryset = queryset.filter(
                status=client_status
            )

        assigned_to = self.request.query_params.get(
            "assigned_to"
        )

        if assigned_to:
            queryset = queryset.filter(
                assigned_to_id=assigned_to
            )

        category = self.request.query_params.get(
            "category"
        )

        if category:
            queryset = queryset.filter(
                category__icontains=category
            )

        return queryset

    def perform_create(self, serializer):

        serializer.save(
            company=self.request.user.company
        )


class ClientDetailAPIView(
    RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer

    def get_queryset(self):

        return Client.objects.filter(
            company=self.request.user.company
        ).select_related(
            "lead",
            "assigned_to"
        )


class ConvertLeadToClientAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        company = request.user.company

        try:

            lead = Lead.objects.get(
                pk=pk,
                company=company
            )

        except Lead.DoesNotExist:

            return Response(
                {
                    "error": "Lead not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Already converted
        if hasattr(lead, "client"):

            client = lead.client

            return Response(
                {
                    "message": "Lead is already converted to a client.",
                    "client_id": client.id,
                },
                status=status.HTTP_200_OK
            )

        client = Client.objects.create(

            company=company,

            lead=lead,

            assigned_to=lead.assigned_to,

            full_name=lead.full_name,

            business_name=lead.business_name,

            email=lead.email,

            phone=lead.phone,

            location=lead.location,

            category=lead.category,

            status=Client.STATUS_PROSPECT,

            notes=lead.notes,
        )

        # Lead becomes won/interested depending on your workflow.
        # Here we keep the lead history as interested.
        if lead.status not in Lead.CLOSED_STATUSES:

            lead.status = Lead.STATUS_INTERESTED

            lead.save(
                update_fields=["status", "updated_at"]
            )

        ClientStatusHistory.objects.create(

            client=client,

            old_status="",

            new_status=Client.STATUS_PROSPECT,

            changed_by=request.user,

            note="Client created from lead.",
        )

        return Response(

            {
                "message": "Lead successfully converted to client.",
                "client": ClientSerializer(
                    client
                ).data,
            },

            status=status.HTTP_201_CREATED
        )



class ClientStatusChangeAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        company = request.user.company

        try:

            client = Client.objects.get(
                pk=pk,
                company=company
            )

        except Client.DoesNotExist:

            return Response(
                {
                    "error": "Client not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get(
            "status"
        )

        note = request.data.get(
            "note",
            ""
        )

        valid_statuses = dict(
            Client.STATUS_CHOICES
        )

        if new_status not in valid_statuses:

            return Response(
                {
                    "error": "Invalid client status.",
                    "allowed_statuses": list(
                        valid_statuses.keys()
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = client.status

        if old_status == new_status:

            return Response(
                {
                    "message": "Client already has this status."
                },
                status=status.HTTP_200_OK
            )

        client.status = new_status

        client.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        ClientStatusHistory.objects.create(

            client=client,

            old_status=old_status,

            new_status=new_status,

            changed_by=request.user,

            note=note,
        )

        return Response(
            {
                "message": "Client status updated successfully.",
                "old_status": old_status,
                "new_status": new_status,
            },
            status=status.HTTP_200_OK
        )


class DealListCreateAPIView(ListCreateAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = DealSerializer
    pagination_class = CRMPagePagination

    def get_queryset(self):

        queryset = Deal.objects.filter(
            company=self.request.user.company
        ).select_related(
            "client",
            "assigned_to"
        )

        search = self.request.query_params.get(
            "search"
        )

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(client__full_name__icontains=search) |
                Q(client__business_name__icontains=search)
            )

        stage = self.request.query_params.get(
            "stage"
        )

        if stage:
            queryset = queryset.filter(
                stage=stage
            )

        assigned_to = self.request.query_params.get(
            "assigned_to"
        )

        if assigned_to:
            queryset = queryset.filter(
                assigned_to_id=assigned_to
            )

        return queryset

    def perform_create(self, serializer):

        deal = serializer.save(
            company=self.request.user.company
        )

        DealStageHistory.objects.create(

            deal=deal,

            old_stage="",

            new_stage=deal.stage,

            changed_by=self.request.user,

            note="Deal created.",
        )


class DealDetailAPIView(
    RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAuthenticated]
    serializer_class = DealSerializer

    def get_queryset(self):

        return Deal.objects.filter(
            company=self.request.user.company
        ).select_related(
            "client",
            "assigned_to"
        )

    def perform_update(self, serializer):

        old_deal = self.get_object()

        old_stage = old_deal.stage

        deal = serializer.save()

        if old_stage != deal.stage:

            DealStageHistory.objects.create(

                deal=deal,

                old_stage=old_stage,

                new_stage=deal.stage,

                changed_by=self.request.user,

                note="Deal stage updated.",
            )

class DealStageChangeAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        company = request.user.company

        try:

            deal = Deal.objects.get(
                pk=pk,
                company=company
            )

        except Deal.DoesNotExist:

            return Response(
                {
                    "error": "Deal not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        new_stage = request.data.get(
            "stage"
        )

        note = request.data.get(
            "note",
            ""
        )

        valid_stages = dict(
            Deal.STAGE_CHOICES
        )

        if new_stage not in valid_stages:

            return Response(
                {
                    "error": "Invalid deal stage.",
                    "allowed_stages": list(
                        valid_stages.keys()
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        old_stage = deal.stage

        if old_stage == new_stage:

            return Response(
                {
                    "message": "Deal already has this stage."
                },
                status=status.HTTP_200_OK
            )

        deal.stage = new_stage

        # Automatic probability
        probability_map = {

            Deal.STAGE_NEW: 10,

            Deal.STAGE_QUALIFICATION: 25,

            Deal.STAGE_PROPOSAL: 50,

            Deal.STAGE_NEGOTIATION: 75,

            Deal.STAGE_WON: 100,

            Deal.STAGE_LOST: 0,
        }

        deal.probability = probability_map.get(
            new_stage,
            deal.probability
        )

        deal.save(
            update_fields=[
                "stage",
                "probability",
                "updated_at"
            ]
        )

        DealStageHistory.objects.create(

            deal=deal,

            old_stage=old_stage,

            new_stage=new_stage,

            changed_by=request.user,

            note=note,
        )

        # Automatically update client
        if new_stage == Deal.STAGE_WON:
            old_client_status = deal.client.status
            deal.client.status = Client.STATUS_WON

            deal.client.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            ClientStatusHistory.objects.create(

                client=deal.client,

                old_status=old_client_status,

                new_status=Client.STATUS_WON,

                changed_by=request.user,

                note="Client marked as won because deal was won.",
            )

        elif new_stage == Deal.STAGE_LOST:

            deal.client.status = Client.STATUS_LOST

            deal.client.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            ClientStatusHistory.objects.create(

                client=deal.client,

                old_status=Client.STATUS_ACTIVE,

                new_status=Client.STATUS_LOST,

                changed_by=request.user,

                note="Client marked as lost because deal was lost.",
            )

        return Response(

            {
                "message": "Deal stage updated successfully.",
                "old_stage": old_stage,
                "new_stage": new_stage,
                "probability": deal.probability,
            },

            status=status.HTTP_200_OK
        )

class CRMDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        leads = Lead.objects.filter(
            company=company
        )

        clients = Client.objects.filter(
            company=company
        )

        deals = Deal.objects.filter(
            company=company
        )

        won_deals = deals.filter(
            stage=Deal.STAGE_WON
        )

        lost_deals = deals.filter(
            stage=Deal.STAGE_LOST
        )

        open_deals = deals.exclude(
            stage__in=[
                Deal.STAGE_WON,
                Deal.STAGE_LOST
            ]
        )

        total_pipeline = (
            open_deals.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        total_won_value = (
            won_deals.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        sales_forecast = sum(
            (
                deal.amount *
                deal.probability /
                100
            )
            for deal in open_deals
        )

        total_leads = leads.count()

        total_clients = clients.count()

        total_deals = deals.count()

        total_deals_closed = won_deals.count()

        total_lost_deals = lost_deals.count()

        conversion_rate = 0

        if total_leads:
            conversion_rate = round(
                (
                    total_deals_closed /
                    total_leads
                ) * 100,
                2
            )

        pending_followups = FollowUpActivity.objects.filter(
            Q(lead__company=company) |
            Q(client__company=company) |
            Q(deal__company=company),
            status=FollowUpActivity.STATUS_PENDING
        ).count()

        overdue_followups = FollowUpActivity.objects.filter(
            Q(lead__company=company) |
            Q(client__company=company) |
            Q(deal__company=company),
            status=FollowUpActivity.STATUS_PENDING,
            scheduled_at__lt=timezone.now()
        ).count()

        invoices = Invoice.objects.filter(
            company=company
        )

        total_invoices = invoices.count()

        paid_invoices = invoices.filter(
            status=Invoice.STATUS_PAID
        ).count()

        pending_invoices = invoices.filter(
            status__in=[
                Invoice.STATUS_SENT,
                Invoice.STATUS_PENDING
            ]
        ).count()

        outstanding_amount = (
            invoices.exclude(
                status=Invoice.STATUS_PAID
            ).aggregate(
                total=Sum("total")
            )["total"] or 0
        )

        return Response({

            "total_leads": total_leads,

            "total_clients": total_clients,

            "total_deals": total_deals,

            "total_deals_closed":
                total_deals_closed,

            "won_deals":
                total_deals_closed,

            "lost_deals":
                total_lost_deals,

            "open_deals":
                open_deals.count(),

            "total_pipeline_value":
                total_pipeline,

            "total_won_value":
                total_won_value,

            "sales_forecast":
                sales_forecast,

            "conversion_rate":
                conversion_rate,

            "pending_followups":
                pending_followups,

            "overdue_followups":
                overdue_followups,

            "total_invoices":
                total_invoices,

            "paid_invoices":
                paid_invoices,

            "pending_invoices":
                pending_invoices,

            "outstanding_amount":
                outstanding_amount,
        })

class CRMActivityListCreateAPIView(
    ListCreateAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CRMActivitySerializer

    pagination_class = CRMPagePagination

    def get_queryset(self):

        company = self.request.user.company

        queryset = CRMActivity.objects.filter(
            company=company
        ).select_related(
            "lead",
            "client",
            "deal",
            "user"
        )

        activity_type = self.request.query_params.get(
            "type"
        )

        if activity_type:
            queryset = queryset.filter(
                activity_type=activity_type
            )

        lead_id = self.request.query_params.get(
            "lead"
        )

        if lead_id:
            queryset = queryset.filter(
                lead_id=lead_id
            )

        client_id = self.request.query_params.get(
            "client"
        )

        if client_id:
            queryset = queryset.filter(
                client_id=client_id
            )

        deal_id = self.request.query_params.get(
            "deal"
        )

        if deal_id:
            queryset = queryset.filter(
                deal_id=deal_id
            )

        return queryset

    def perform_create(self, serializer):

        serializer.save(
            company=self.request.user.company,
            user=self.request.user
        )
def generate_invoice_number(company):
    last_invoice = Invoice.objects.filter(
        company=company
    ).order_by("-id").first()

    if last_invoice:
        try:
            number = int(
                last_invoice.invoice_number.split("-")[-1]
            ) + 1
        except (ValueError, AttributeError):
            number = last_invoice.id + 1
    else:
        number = 1

    return f"INV-{number:06d}"


class InvoiceListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer
    pagination_class = CRMPagePagination

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        queryset = Invoice.objects.filter(
            company=self.request.user.company
        ).select_related(
            "client",
            "deal",
            "company"
        )

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(client__full_name__icontains=search) |
                Q(client__business_name__icontains=search) |
                Q(service__icontains=search)
            )

        invoice_status = self.request.query_params.get("status")

        if invoice_status:
            queryset = queryset.filter(
                status=invoice_status
            )

        return queryset

    def perform_create(self, serializer):
        company = self.request.user.company

        invoice = serializer.save(
            company=company,
            invoice_number=generate_invoice_number(company)
        )

        invoice.calculate_total()

        invoice.save(
            update_fields=[
                "subtotal",
                "total",
                "updated_at"
            ]
        )


class InvoiceDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        return Invoice.objects.filter(
            company=self.request.user.company
        ).select_related(
            "client",
            "deal",
            "company"
        )

    def perform_update(self, serializer):
        invoice = serializer.save()

        invoice.calculate_total()

        invoice.save(
            update_fields=[
                "subtotal",
                "total",
                "updated_at"
            ]
        )


class InvoiceGeneratePDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        company = request.user.company

        try:
            invoice = Invoice.objects.select_related(
                "client",
                "deal",
                "company"
            ).get(
                pk=pk,
                company=company
            )
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        invoice.calculate_total()
        invoice.save(
            update_fields=[
                "subtotal",
                "total",
                "updated_at"
            ]
        )

        response = HttpResponse(
            content_type="application/pdf"
        )

        doc = SimpleDocTemplate(
            response,
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "InvoiceTitle",
            parent=styles["Title"],
            fontSize=22,
            spaceAfter=8
        )

        normal_style = ParagraphStyle(
            "InvoiceNormal",
            parent=styles["Normal"],
            fontSize=9,
            leading=13
        )

        small_style = ParagraphStyle(
            "InvoiceSmall",
            parent=styles["Normal"],
            fontSize=8,
            leading=11
        )

        story = []

        if company.logo:
            try:
                logo = Image(
                    company.logo.path,
                    width=40 * mm,
                    height=22 * mm,
                    kind="proportional"
                )

                story.append(logo)
                story.append(
                    Spacer(1, 5 * mm)
                )
            except Exception:
                pass

        story.append(
            Paragraph(
                company.name,
                title_style
            )
        )

        company_details = []

        if company.business_type:
            company_details.append(
                company.business_type
            )

        if company.industry:
            company_details.append(
                company.industry
            )

        if company.address:
            company_details.append(
                company.address
            )

        location = ", ".join(
            value
            for value in [
                company.city,
                company.state,
                company.country
            ]
            if value
        )

        if location:
            company_details.append(location)

        if company.email:
            company_details.append(
                company.email
            )

        if company.phone:
            company_details.append(
                company.phone
            )

        for detail in company_details:
            story.append(
                Paragraph(
                    detail,
                    small_style
                )
            )

        story.append(
            Spacer(1, 8 * mm)
        )

        invoice_header = Table(
            [
                [
                    Paragraph(
                        "<b>INVOICE</b>",
                        title_style
                    ),
                    Paragraph(
                        f"<b>{invoice.invoice_number}</b><br/>"
                        f"Issue Date: {invoice.issue_date}<br/>"
                        f"Due Date: {invoice.due_date}<br/>"
                        f"Status: {invoice.get_status_display()}",
                        normal_style
                    )
                ]
            ],
            colWidths=[
                90 * mm,
                75 * mm
            ]
        )

        invoice_header.setStyle(
            TableStyle([
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "ALIGN",
                    (1, 0),
                    (1, 0),
                    "RIGHT"
                )
            ])
        )

        story.append(invoice_header)

        story.append(
            Spacer(1, 8 * mm)
        )

        client_details = (
            f"<b>Bill To</b><br/>"
            f"{invoice.client.full_name}<br/>"
        )

        if invoice.client.business_name:
            client_details += (
                f"{invoice.client.business_name}<br/>"
            )

        if invoice.client.email:
            client_details += (
                f"{invoice.client.email}<br/>"
            )

        if invoice.client.phone:
            client_details += (
                f"{invoice.client.phone}<br/>"
            )

        if invoice.client.location:
            client_details += (
                f"{invoice.client.location}"
            )

        story.append(
            Paragraph(
                client_details,
                normal_style
            )
        )

        story.append(
            Spacer(1, 8 * mm)
        )

        item_data = [
            [
                Paragraph(
                    "<b>Service</b>",
                    normal_style
                ),
                Paragraph(
                    "<b>Description</b>",
                    normal_style
                ),
                Paragraph(
                    "<b>Qty</b>",
                    normal_style
                ),
                Paragraph(
                    "<b>Unit Price</b>",
                    normal_style
                ),
                Paragraph(
                    "<b>Amount</b>",
                    normal_style
                )
            ],
            [
                Paragraph(
                    invoice.service or "Service",
                    normal_style
                ),
                Paragraph(
                    invoice.description or "—",
                    normal_style
                ),
                str(invoice.quantity),
                f"{invoice.currency} {invoice.unit_price:,.2f}",
                f"{invoice.currency} {invoice.subtotal:,.2f}"
            ]
        ]

        items_table = Table(
            item_data,
            colWidths=[
                35 * mm,
                60 * mm,
                15 * mm,
                25 * mm,
                30 * mm
            ]
        )

        items_table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#f3f3f3")
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#dddddd")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ])
        )

        story.append(items_table)

        story.append(
            Spacer(1, 8 * mm)
        )

        totals_data = [
            [
                "Subtotal",
                f"{invoice.currency} {invoice.subtotal:,.2f}"
            ],
            [
                "Tax",
                f"{invoice.currency} {invoice.tax:,.2f}"
            ],
            [
                "Discount",
                f"{invoice.currency} {invoice.discount:,.2f}"
            ],
            [
                "<b>Total</b>",
                f"<b>{invoice.currency} {invoice.total:,.2f}</b>"
            ]
        ]

        totals_table = Table(
            totals_data,
            colWidths=[
                125 * mm,
                40 * mm
            ]
        )

        totals_table.setStyle(
            TableStyle([
                (
                    "ALIGN",
                    (1, 0),
                    (1, -1),
                    "RIGHT"
                ),
                (
                    "LINEABOVE",
                    (0, -1),
                    (-1, -1),
                    1,
                    colors.black
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                )
            ])
        )

        story.append(totals_table)

        story.append(
            Spacer(1, 8 * mm)
        )

        if invoice.payment_method:
            story.append(
                Paragraph(
                    f"<b>Payment Method:</b> "
                    f"{invoice.payment_method}",
                    normal_style
                )
            )

        if invoice.payment_terms:
            story.append(
                Paragraph(
                    f"<b>Payment Terms:</b> "
                    f"{invoice.payment_terms}",
                    normal_style
                )
            )

        if invoice.notes:
            story.append(
                Spacer(1, 4 * mm)
            )

            story.append(
                Paragraph(
                    f"<b>Notes:</b><br/>"
                    f"{invoice.notes}",
                    normal_style
                )
            )

        story.append(
            Spacer(1, 10 * mm)
        )

        story.append(
            Paragraph(
                "Thank you for your business.",
                normal_style
            )
        )

        doc.build(story)

        pdf_content = response.content

        invoice.pdf_file.save(
            f"{invoice.invoice_number}.pdf",
            ContentFile(pdf_content),
            save=True
        )

        return Response(
            {
                "message": "Invoice PDF generated successfully.",
                "invoice": InvoiceSerializer(
                    invoice,
                    context={
                        "request": request
                    }
                ).data
            },
            status=status.HTTP_200_OK
        )


class InvoiceDownloadPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        company = request.user.company

        try:
            invoice = Invoice.objects.get(
                pk=pk,
                company=company
            )
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not invoice.pdf_file:
            return Response(
                {
                    "error":
                    "Invoice PDF has not been generated yet."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with invoice.pdf_file.open("rb") as pdf:
                response = HttpResponse(
                    pdf.read(),
                    content_type="application/pdf"
                )

            response["Content-Disposition"] = (
                f'attachment; '
                f'filename="{invoice.invoice_number}.pdf"'
            )

            return response

        except Exception:
            return Response(
                {
                    "error":
                    "Unable to download invoice PDF."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InvoiceSendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        company = request.user.company

        try:
            invoice = Invoice.objects.select_related(
                "client",
                "company"
            ).get(
                pk=pk,
                company=company
            )
        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not invoice.client.email:
            return Response(
                {
                    "error":
                    "Client does not have an email address."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not invoice.pdf_file:
            return Response(
                {
                    "error":
                    "Generate the invoice PDF before sending."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with invoice.pdf_file.open("rb") as pdf:
                pdf_content = pdf.read()

            email = EmailMessage(
                subject=(
                    f"Invoice {invoice.invoice_number} "
                    f"from {company.name}"
                ),
                body=(
                    f"Hello {invoice.client.full_name},\n\n"
                    f"Please find your invoice "
                    f"{invoice.invoice_number} attached.\n\n"
                    f"Total: "
                    f"{invoice.currency} "
                    f"{invoice.total:,.2f}\n\n"
                    f"Thank you,\n"
                    f"{company.name}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[invoice.client.email]
            )

            email.attach(
                f"{invoice.invoice_number}.pdf",
                pdf_content,
                "application/pdf"
            )

            email.send(
                fail_silently=False
            )

            invoice.status = Invoice.STATUS_SENT

            invoice.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                {
                    "message":
                    "Invoice sent to client successfully.",
                    "status": invoice.status
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "error":
                    f"Unable to send invoice: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomFieldListCreateAPIView(
    ListCreateAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomFieldSerializer

    def get_queryset(self):

        queryset = CustomField.objects.filter(
            company=self.request.user.company
        )

        entity_type = self.request.query_params.get(
            "entity_type"
        )

        if entity_type:
            queryset = queryset.filter(
                entity_type=entity_type
            )

        return queryset

    def perform_create(self, serializer):

        serializer.save(
            company=self.request.user.company
        )


class CustomFieldDetailAPIView(
    RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomFieldSerializer

    def get_queryset(self):

        return CustomField.objects.filter(
            company=self.request.user.company
        )
class CustomFieldValueListCreateAPIView(
    ListCreateAPIView
):

    permission_classes = [IsAuthenticated]

    serializer_class = CustomFieldValueSerializer

    def get_queryset(self):

        company = self.request.user.company

        queryset = CustomFieldValue.objects.filter(
            field__company=company
        ).select_related(
            "field",
            "lead",
            "client",
            "deal"
        )

        lead_id = self.request.query_params.get(
            "lead"
        )

        if lead_id:
            queryset = queryset.filter(
                lead_id=lead_id
            )

        client_id = self.request.query_params.get(
            "client"
        )

        if client_id:
            queryset = queryset.filter(
                client_id=client_id
            )

        deal_id = self.request.query_params.get(
            "deal"
        )

        if deal_id:
            queryset = queryset.filter(
                deal_id=deal_id
            )

        return queryset
class SalesReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        deals = Deal.objects.filter(
            company=company
        )

        stage_data = []

        for stage, label in Deal.STAGE_CHOICES:

            qs = deals.filter(
                stage=stage
            )

            amount = (
                qs.aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            stage_data.append({
                "stage": stage,
                "label": label,
                "count": qs.count(),
                "amount": amount,
            })

        monthly_won = []

        for month in range(1, 13):

            qs = deals.filter(
                stage=Deal.STAGE_WON,
                expected_close_date__month=month
            )

            amount = (
                qs.aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            monthly_won.append({
                "month": month,
                "deals": qs.count(),
                "amount": amount,
            })

        return Response({
            "pipeline_by_stage": stage_data,
            "monthly_won_sales": monthly_won,
        })
class LeadExportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        company = request.user.company

        leads = Lead.objects.filter(
            company=company
        )

        response = HttpResponse(
            content_type="text/csv"
        )

        response["Content-Disposition"] = (
            'attachment; filename="leads.csv"'
        )

        writer = csv.writer(response)

        writer.writerow([
            "Name",
            "Email",
            "Phone",
            "Business",
            "Location",
            "Category",
            "Company Size",
            "Score",
            "Source",
            "Status",
            "Created At",
        ])

        for lead in leads:

            writer.writerow([
                lead.full_name,
                lead.email,
                lead.phone,
                lead.business_name,
                lead.location,
                lead.category,
                lead.company_size,
                lead.score,
                lead.source,
                lead.status,
                lead.created_at,
            ])

        return response

class BulkDeleteLeadsAPIView(APIView):
    """Delete multiple leads at once, or all leads matching current filters."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = request.user.company

        lead_ids = request.data.get("ids")
        delete_all = request.data.get("delete_all", False)

        queryset = Lead.objects.filter(company=company)

        if delete_all:
            # Same filters jo list API mein support hain — taake "delete all
            # matching current search/filter" bhi kaam kare
            search = request.data.get("search")
            lead_status = request.data.get("status")
            source = request.data.get("source")
            assigned_to = request.data.get("assigned_to")
            category = request.data.get("category")

            if search:
                queryset = queryset.filter(
                    Q(full_name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(phone__icontains=search) |
                    Q(business_name__icontains=search) |
                    Q(location__icontains=search) |
                    Q(category__icontains=search)
                )
            if lead_status:
                queryset = queryset.filter(status=lead_status)
            if source:
                queryset = queryset.filter(source=source)
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            if category:
                queryset = queryset.filter(category__icontains=category)

        elif lead_ids:
            if not isinstance(lead_ids, list) or not lead_ids:
                return Response(
                    {"error": "Provide a non-empty list of lead ids in 'ids', or set 'delete_all': true."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            queryset = queryset.filter(id__in=lead_ids)

        else:
            return Response(
                {"error": "Provide either 'ids' (list) or 'delete_all': true."},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count, _ = queryset.delete()

        return Response(
            {
                "message": f"{deleted_count} lead(s) deleted successfully.",
                "deleted_count": deleted_count,
            },
            status=status.HTTP_200_OK
        )