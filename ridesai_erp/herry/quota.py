from decimal import Decimal
from django.utils import timezone

from .models import HerryMessage


# ============================================================
# HERRY PLAN CONFIGURATION
# ============================================================

HERRY_PLANS = {
    "Standard": {
        "monthly_price": Decimal("5"),
        "yearly_price": Decimal("54"),
        "monthly_messages": 250,
        "yearly_messages": 3000,
    },

    "Premium": {
        "monthly_price": Decimal("20"),
        "yearly_price": Decimal("216"),
        "monthly_messages": 2500,
        "yearly_messages": 30000,
    },

    "Gold": {
        "monthly_price": Decimal("50"),
        "yearly_price": Decimal("540"),
        "monthly_messages": 5000,
        "yearly_messages": 60000,
    },
}


# ============================================================
# NORMALIZE PLAN NAME
# ============================================================

def normalize_plan_name(plan_name):

    if not plan_name:
        return "Standard"

    plan_name = str(plan_name).strip().lower()

    aliases = {
        "standard": "Standard",
        "premium": "Premium",
        "gold": "Gold",

        "5": "Standard",
        "$5": "Standard",

        "20": "Premium",
        "$20": "Premium",

        "50": "Gold",
        "$50": "Gold",
    }

    return aliases.get(
        plan_name,
        "Standard"
    )

# ============================================================
# GET COMPANY PLAN
# ============================================================

def get_company_plan(company):
    """
    Company ke plan ka naam safely retrieve karta hai.

    Company model mein agar plan ForeignKey hai:
        company.plan.name

    Agar direct string hai:
        company.plan
    """

    if not company:
        return "Standard"

    plan = getattr(company, "plan", None)

    if not plan:
        return "Standard"

    # ForeignKey Plan object
    if hasattr(plan, "name"):
        plan_name = plan.name

    else:
        plan_name = plan

    return normalize_plan_name(plan_name)


# ============================================================
# GET BILLING INTERVAL
# ============================================================

def get_billing_interval(company):
    """
    Company ka billing interval return karta hai.

    Expected:
        monthly
        yearly

    Agar field nahi milti to monthly default hoga.
    """

    if not company:
        return "monthly"

    # Possible fields
    interval = getattr(
        company,
        "billing_interval",
        None
    )

    if not interval:
        interval = getattr(
            company,
            "billing_cycle",
            None
        )

    if not interval:
        interval = getattr(
            company,
            "interval",
            None
        )

    # Agar plan object mein interval hai
    if not interval:

        plan = getattr(
            company,
            "plan",
            None
        )

        if plan:
            interval = getattr(
                plan,
                "billing_interval",
                None
            )

    if not interval:
        return "monthly"

    interval = str(interval).strip().lower()

    # Normalize yearly values
    if interval in [
        "year",
        "yearly",
        "annual",
        "annually",
        "12_months",
    ]:
        return "yearly"

    return "monthly"


# ============================================================
# GET HERRY LIMIT
# ============================================================

def get_herry_limit(company):

    plan_name = get_company_plan(company)
    billing_interval = get_billing_interval(company)

    plan_config = HERRY_PLANS.get(
        plan_name,
        HERRY_PLANS["Standard"]
    )

    if billing_interval == "yearly":

        return plan_config[
            "yearly_messages"
        ]

    return plan_config[
        "monthly_messages"
    ]


# ============================================================
# GET PLAN PRICE
# ============================================================

def get_herry_plan_price(company):


    plan_name = get_company_plan(company)
    billing_interval = get_billing_interval(company)

    plan_config = HERRY_PLANS.get(
        plan_name,
        HERRY_PLANS["Standard"]
    )

    if billing_interval == "yearly":

        return plan_config[
            "yearly_price"
        ]

    return plan_config[
        "monthly_price"
    ]


# ============================================================
# GET SUBSCRIPTION PERIOD
# ============================================================

def get_subscription_period(company):
    """
    Subscription ka start aur end period determine karta hai.

    Agar company ke paas subscription dates hain,
    unko prefer karega.

    Otherwise:
        monthly -> current calendar month
        yearly  -> current calendar year

    IMPORTANT:
    Agar tumhare subscription model mein exact
    start/end dates hain to yahan un fields ko use karo.
    """

    now = timezone.localtime()

    billing_interval = get_billing_interval(
        company
    )

    # --------------------------------------------------------
    # Possible subscription start fields
    # --------------------------------------------------------

    subscription_start = getattr(
        company,
        "subscription_start_date",
        None
    )

    if not subscription_start:
        subscription_start = getattr(
            company,
            "subscription_started_at",
            None
        )

    if not subscription_start:
        subscription_start = getattr(
            company,
            "current_period_start",
            None
        )

    # --------------------------------------------------------
    # Possible subscription end fields
    # --------------------------------------------------------

    subscription_end = getattr(
        company,
        "subscription_end_date",
        None
    )

    if not subscription_end:
        subscription_end = getattr(
            company,
            "subscription_ends_at",
            None
        )

    if not subscription_end:
        subscription_end = getattr(
            company,
            "current_period_end",
            None
        )

    # --------------------------------------------------------
    # If exact subscription period exists
    # --------------------------------------------------------

    if subscription_start and subscription_end:

        return (
            subscription_start,
            subscription_end
        )

    # ========================================================
    # MONTHLY FALLBACK
    # ========================================================

    if billing_interval == "monthly":

        start = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        if now.month == 12:

            next_month = now.replace(
                year=now.year + 1,
                month=1,
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )

        else:

            next_month = now.replace(
                month=now.month + 1,
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )

        return start, next_month

    # ========================================================
    # YEARLY FALLBACK
    # ========================================================

    start = now.replace(
        month=1,
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    end = now.replace(
        year=now.year + 1,
        month=1,
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    return start, end


# ============================================================
# GET HERRY USAGE
# ============================================================

def get_herry_usage(company):
    """
    Current subscription period mein Herry ke USER messages
    count karta hai.

    Assistant messages count nahi honge.

    1 user question = 1 Herry message.
    """

    if not company:

        return {
            "used": 0,
            "limit": 0,
            "remaining": 0,
            "percentage": 0,
            "is_limit_reached": True,
            "plan": None,
            "billing_interval": None,
            "price": "0",
        }

    start_date, end_date = get_subscription_period(
        company
    )

    used = HerryMessage.objects.filter(
        conversation__company=company,

        role=HerryMessage.ROLE_USER,

        created_at__gte=start_date,

        created_at__lt=end_date,
    ).count()

    limit = get_herry_limit(company)

    remaining = max(
        limit - used,
        0
    )

    if limit > 0:

        percentage = round(
            (used / limit) * 100,
            2
        )

    else:

        percentage = 100

    return {
        "used": used,
        "limit": limit,
        "remaining": remaining,
        "percentage": percentage,
        "is_limit_reached": used >= limit,

        "plan": get_company_plan(company),

        "billing_interval": get_billing_interval(
            company
        ),

        "price": str(
            get_herry_plan_price(company)
        ),

        "period_start": start_date,
        "period_end": end_date,
    }


# ============================================================
# CHECK HERRY QUOTA
# ============================================================

def check_herry_quota(company):
    """
    Check karta hai ke company Herry ka message
    send kar sakti hai ya nahi.
    """

    usage = get_herry_usage(
        company
    )

    if usage["is_limit_reached"]:

        return False, usage

    return True, usage


# ============================================================
# GET REMAINING MESSAGES
# ============================================================

def get_remaining_herry_messages(company):

    usage = get_herry_usage(
        company
    )

    return usage["remaining"]


# ============================================================
# GET HERRY PLAN INFORMATION
# ============================================================

def get_herry_plan_info(company):
    """
    Frontend ko plan + usage information dene ke liye.
    """

    plan_name = get_company_plan(
        company
    )

    billing_interval = get_billing_interval(
        company
    )

    plan_config = HERRY_PLANS.get(
        plan_name,
        HERRY_PLANS["Standard"]
    )

    usage = get_herry_usage(
        company
    )

    if billing_interval == "yearly":

        price = plan_config[
            "yearly_price"
        ]

        limit = plan_config[
            "yearly_messages"
        ]

    else:

        price = plan_config[
            "monthly_price"
        ]

        limit = plan_config[
            "monthly_messages"
        ]

    return {
        "plan": plan_name,

        "billing_interval": billing_interval,

        "price": str(price),

        "message_limit": limit,

        "used": usage["used"],

        "remaining": usage["remaining"],

        "percentage": usage["percentage"],

        "is_limit_reached": usage[
            "is_limit_reached"
        ],

        "period_start": usage[
            "period_start"
        ],

        "period_end": usage[
            "period_end"
        ],
    }