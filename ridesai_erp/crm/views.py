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


class LeadPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class LeadListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    pagination_class = LeadPagination

    def get_queryset(self):
        return Lead.objects.filter(company=self.request.user.company)

    def perform_create(self, serializer):
        lead = serializer.save(
            company=self.request.user.company,
            source="manual",
        )
        lead.score = calculate_lead_score(lead)
        lead.save(update_fields=["score"])
        create_followups_for_lead(lead)

class LeadDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer

    def get_queryset(self):
        return Lead.objects.filter(company=self.request.user.company)

    def perform_update(self, serializer):
        lead = serializer.save()
        lead.score = calculate_lead_score(lead)
        lead.save(update_fields=["score"])


class LeadImportAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded."}, status=400)

        company = request.user.company

        try:
            df = read_leads_file(file)
        except Exception as e:
            return Response({"error": f"Could not read file: {str(e)}"}, status=400)

        column_map = detect_columns(df)

        if "full_name" not in column_map:
            return Response(
                {"error": "Could not detect a 'name' column in the file."},
                status=400
            )
        total_rows = len(df)
        imported = 0
        duplicates = 0
        invalid = 0

        for _, row in df.iterrows():

            row_data = {
                field: (str(row[col]).strip() if col in row and pd.notna(row[col]) else "")
                for field, col in column_map.items()
            }

            if not is_valid_row(row_data):
                invalid += 1
                continue

            email = row_data.get("email", "")
            phone = row_data.get("phone", "")

            existing = Lead.objects.filter(company=company)
            if email:
                existing = existing.filter(email=email)
            elif phone:
                existing = existing.filter(phone=phone)
            else:
                existing = existing.none()

            if existing.exists():
                duplicates += 1
                continue

            company_size = None
            if row_data.get("company_size"):
                try:
                    company_size = int(float(row_data["company_size"]))
                except ValueError:
                    company_size = None

            lead = Lead.objects.create(
                company=company,
                full_name=row_data.get("full_name", ""),
                email=email,
                phone=phone,
                business_name=row_data.get("business_name", ""),
                location=row_data.get("location", ""),
                category=row_data.get("category", ""),
                company_size=company_size,
                source="import",
            )

            lead.score = calculate_lead_score(lead)
            lead.save(update_fields=["score"])

            create_followups_for_lead(lead)

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
            company=company, connected=True
        ).exists()

        return Response({
            "total_rows": total_rows,
            "imported": imported,
            "duplicates": duplicates,
            "invalid": invalid,
            "mailbox_connected": mailbox_connected,
        }, status=status.HTTP_201_CREATED)