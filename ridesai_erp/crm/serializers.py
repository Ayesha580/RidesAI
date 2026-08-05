from rest_framework import serializers
from .models import Lead, FollowUpActivity


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