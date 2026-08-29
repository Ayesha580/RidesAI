from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    path(
        "register/",
        views.RegisterAPIView.as_view(),
        name="api-register"
    ),
    path("complete-registration/", views.CompleteRegistrationAPIView.as_view()),
    path("admin-login/", views.AdminLoginAPIView.as_view(), name="admin-login"),
    path(
    "payment-success/",
    views.PaymentSuccessAPIView.as_view()
    ),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path(
            "token/refresh/",
            TokenRefreshView.as_view(),
            name="token_refresh"
        ),
    path("users/", views.UserListAPIView.as_view(), name="user-list"),
    path("owner/profile/", views.OwnerProfileAPIView.as_view(), name="owner-profile"),
]