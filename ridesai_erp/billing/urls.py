from django.urls import path
from .views import CreateCheckoutAPIView, PaymentSuccessAPIView,UpgradePlanAPIView,PolarWebhookAPIView

urlpatterns = [
    path(
        "create-checkout/",
        CreateCheckoutAPIView.as_view(),
    ),
    path("webhook/", PolarWebhookAPIView.as_view()),

    path(
        "payment-success/",
        PaymentSuccessAPIView.as_view(),
    ),
    path("upgrade-plan/", UpgradePlanAPIView.as_view()),
]