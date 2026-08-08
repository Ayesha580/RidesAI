
from rest_framework import serializers
from companies.models import Plan, Company

class PlanSerializer(serializers.ModelSerializer):
    max_seats = serializers.IntegerField(source="seats")
    company_count = serializers.SerializerMethodField()

    class Meta:
        model = Plan
        fields = [
            "id",
            "name",
            "price",
            "billing_cycle",
            "max_seats",
            "company_count",
            "is_active",
            "description"
        ]

    def get_company_count(self, obj):
        return obj.company_set.count()