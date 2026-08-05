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
        "price": 5,
        "description": "Standard Plan",
    },
    {
        "name": "Premium",
        "price": 20,
        "description": "Premium Plan",
    },
    {
        "name": "Gold",
        "price": 50,
        "description": "Gold Plan",
    },
]

    for plan in plans:
        Plan.objects.update_or_create(
            name=plan["name"],
            defaults={
                "price": plan["price"],
                "description": plan["description"],
                "features": [],
                "is_active": True,
            },
        )