# companies/serializers.py  (NEW FILE)

from rest_framework import serializers
from .models import Plan, Company


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'price', 'max_users', 'description']


class CompanySerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'status', 'plan',
            'payment_reference', 'payment_proof',
            'created_at',
        ]
