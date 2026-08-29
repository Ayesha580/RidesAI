from crm.models import Lead


def get_hot_leads(user):
    return Lead.objects.filter(
        company=user.company,
        status__in=[
            Lead.STATUS_NEW,
            Lead.STATUS_CONTACTED,
            Lead.STATUS_INTERESTED,
        ],
        score__gte=70,
    ).values(
        "id",
        "full_name",
        "business_name",
        "category",
        "location",
        "score",
        "status",
        "next_followup_date",
        "assigned_to__first_name",
        "assigned_to__last_name",
    )