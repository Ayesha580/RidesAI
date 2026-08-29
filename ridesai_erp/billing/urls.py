from django.urls import path

from .views import (
    CreateCheckoutAPIView,
    PaymentSuccessAPIView,
    UpgradePlanAPIView,
    PolarWebhookAPIView,
    SubscriptionDetailsAPIView,
    CustomerSessionAPIView,
    CancelSubscriptionAPIView,
    ResumeSubscriptionAPIView,
)

urlpatterns = [
    path(
        "create-checkout/",
        CreateCheckoutAPIView.as_view(),
        name="create-checkout",
    ),

    path(
        "webhook/",
        PolarWebhookAPIView.as_view(),
        name="polar-webhook",
    ),

    path(
        "payment-success/",
        PaymentSuccessAPIView.as_view(),
        name="payment-success",
    ),

    path(
        "upgrade-plan/",
        UpgradePlanAPIView.as_view(),
        name="upgrade-plan",
    ),

    path(
        "subscription/",
        SubscriptionDetailsAPIView.as_view(),
        name="billing-subscription",
    ),

    # path(
    #     "customer-portal/",
    #     CustomerPortalAPIView.as_view(),
    #     name="billing-customer-portal",
    # ),
        path(
        "customer-session/",
        CustomerSessionAPIView.as_view(),
    ),

    path(
        "cancel/",
        CancelSubscriptionAPIView.as_view(),
        name="billing-cancel",
    ),

    path(
        "resume/",
        ResumeSubscriptionAPIView.as_view(),
        name="billing-resume",
    ),
]