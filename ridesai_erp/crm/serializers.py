from rest_framework import serializers
from .models import (
    Lead,
    FollowUpActivity,
    Client,
    Deal,
    DealStageHistory,
    ClientStatusHistory,
    CRMActivity,Invoice,CustomField,CustomFieldValue
)

class FollowUpActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpActivity
        fields = ("id", "activity_type", "scheduled_at", "message", "status", "created_at")


class LeadSerializer(serializers.ModelSerializer):
    follow_ups = FollowUpActivitySerializer(many=True, read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = (
            "id", "full_name", "phone", "email", "interest", "notes",
            "business_name", "location", "category", "company_size",
            "score", "source", "status", "next_followup_date",
            "assigned_to", "assigned_to_name", "follow_ups", "created_at",
        )
        read_only_fields = ("score", "source", "follow_ups")

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None



class DealStageHistorySerializer(serializers.ModelSerializer):

    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DealStageHistory
        fields = (
            "id",
            "old_stage",
            "new_stage",
            "changed_by",
            "changed_by_name",
            "note",
            "created_at",
        )

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return (
                obj.changed_by.get_full_name()
                or obj.changed_by.username
            )
        return None


class ClientStatusHistorySerializer(serializers.ModelSerializer):

    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ClientStatusHistory
        fields = (
            "id",
            "old_status",
            "new_status",
            "changed_by",
            "changed_by_name",
            "note",
            "created_at",
        )

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return (
                obj.changed_by.get_full_name()
                or obj.changed_by.username
            )
        return None


class ClientSerializer(serializers.ModelSerializer):

    assigned_to_name = serializers.SerializerMethodField()
    status_history = ClientStatusHistorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Client
        fields = (
            "id",
            "lead",
            "full_name",
            "business_name",
            "email",
            "phone",
            "location",
            "category",
            "status",
            "notes",
            "assigned_to",
            "assigned_to_name",
            "status_history",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "company",
            "status_history",
        )

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return (
                obj.assigned_to.get_full_name()
                or obj.assigned_to.username
            )
        return None


class DealSerializer(serializers.ModelSerializer):

    client_name = serializers.CharField(
        source="client.full_name",
        read_only=True
    )

    assigned_to_name = serializers.SerializerMethodField()

    stage_history = DealStageHistorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Deal
        fields = (
            "id",
            "client",
            "client_name",
            "title",
            "amount",
            "currency",
            "stage",
            "probability",
            "expected_close_date",
            "description",
            "assigned_to",
            "assigned_to_name",
            "stage_history",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "company",
            "stage_history",
        )

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return (
                obj.assigned_to.get_full_name()
                or obj.assigned_to.username
            )
        return None

# =========================
# ACTIVITY SERIALIZER
# =========================

class CRMActivitySerializer(serializers.ModelSerializer):

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = CRMActivity
        fields = (
            "id",
            "lead",
            "client",
            "deal",
            "user",
            "user_name",
            "activity_type",
            "title",
            "description",
            "scheduled_at",
            "completed_at",
            "created_at",
        )

        read_only_fields = (
            "user",
            "user_name",
            "created_at",
        )

    def get_user_name(self, obj):
        if obj.user:
            return (
                obj.user.get_full_name()
                or obj.user.username
            )
        return None


# =========================
# INVOICE SERIALIZER
# =========================
class InvoiceSerializer(serializers.ModelSerializer):

    client_name = serializers.CharField(
        source="client.full_name",
        read_only=True
    )

    client_business_name = serializers.CharField(
        source="client.business_name",
        read_only=True
    )

    client_email = serializers.CharField(
        source="client.email",
        read_only=True
    )

    client_phone = serializers.CharField(
        source="client.phone",
        read_only=True
    )

    deal_title = serializers.CharField(
        source="deal.title",
        read_only=True
    )

    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice

        fields = (
            "id",
            "invoice_number",

            "client",
            "client_name",
            "client_business_name",
            "client_email",
            "client_phone",

            "deal",
            "deal_title",

            "issue_date",
            "due_date",

            "service",
            "description",
            "quantity",
            "unit_price",

            "subtotal",
            "tax",
            "discount",
            "total",

            "paid_amount",
            "currency",

            "payment_method",
            "payment_terms",

            "status",
            "notes",

            "pdf_file",
            "pdf_url",

            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "company",
            "invoice_number",
            "subtotal",
            "total",
            "pdf_file",
            "pdf_url",
        )

    def get_pdf_url(self, obj):
        request = self.context.get("request")

        if obj.pdf_file and request:
            return request.build_absolute_uri(
                obj.pdf_file.url
            )

        return None

    def create(self, validated_data):

        invoice = Invoice.objects.create(
            **validated_data
        )

        invoice.calculate_total()

        invoice.save(
            update_fields=[
                "subtotal",
                "total",
            ]
        )

        return invoice

    def update(self, instance, validated_data):

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.calculate_total()

        instance.save()

        return instance
# =========================
# CUSTOM FIELD
# =========================

class CustomFieldSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomField

        fields = (
            "id",
            "name",
            "key",
            "field_type",
            "entity_type",
            "options",
            "required",
            "created_at",
        )

        read_only_fields = (
            "company",
        )


class CustomFieldValueSerializer(serializers.ModelSerializer):

    field_name = serializers.CharField(
        source="field.name",
        read_only=True
    )

    class Meta:
        model = CustomFieldValue

        fields = (
            "id",
            "field",
            "field_name",
            "lead",
            "client",
            "deal",
            "value",
        )
