from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Plan


@receiver(post_migrate)
def create_default_plans(sender, **kwargs):
    if sender.name != "companies":
        return

    plans = [
        {
            "name": "Standard",
            "billing_cycle": Plan.BILLING_MONTHLY,
            "price": 5,
            "description": "Standard Plan (Monthly)",
        },
        {
            "name": "Standard",
            "billing_cycle": Plan.BILLING_YEARLY,
            "price": 50,   # apni yearly price
            "description": "Standard Plan (Yearly)",
        },
        {
            "name": "Premium",
            "billing_cycle": Plan.BILLING_MONTHLY,
            "price": 20,
            "description": "Premium Plan (Monthly)",
        },
        {
            "name": "Premium",
            "billing_cycle": Plan.BILLING_YEARLY,
            "price": 200,
            "description": "Premium Plan (Yearly)",
        },
        {
            "name": "Gold",
            "billing_cycle": Plan.BILLING_MONTHLY,
            "price": 50,
            "description": "Gold Plan (Monthly)",
        },
        {
            "name": "Gold",
            "billing_cycle": Plan.BILLING_YEARLY,
            "price": 500,
            "description": "Gold Plan (Yearly)",
        },
    ]

    for plan in plans:
        Plan.objects.update_or_create(
            name=plan["name"],
            billing_cycle=plan["billing_cycle"],
            defaults={
                "price": plan["price"],
                "description": plan["description"],
                "features": [],
                "is_active": True,
            },
        )