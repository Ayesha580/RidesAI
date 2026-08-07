from django.urls import path
from . import views
from .superadmin_views import (
    SuperAdminCompanyListAPIView,
    SuperAdminCompanyDetailAPIView,
    SuperAdminUserListAPIView,
    SuperAdminUserDetailAPIView,
    SuperAdminPaymentsAPIView,
)

urlpatterns = [
    path(
            "admin/",
            views.AdminDashboardAPIView.as_view(),
            name="admin-dashboard"
        ),
    path('owner/', views.OwnerDashboardAPIView.as_view(), name='api-dashboard-owner'),
    path('hr/', views.HRDashboardAPIView.as_view(), name='api-dashboard-hr'),
    path('employee/', views.EmployeeDashboardAPIView.as_view(), name='api-dashboard-employee'),
    path('manager/', views.ManagerDashboardAPIView.as_view(), name='api-dashboard-manager'),
    path('accountant/', views.AccountantDashboardAPIView.as_view(), name='api-dashboard-accountant'),
    path('crm/', views.CRMDashboardAPIView.as_view(), name='api-dashboard-crm'),
]
urlpatterns += [
    path("superadmin/companies/", SuperAdminCompanyListAPIView.as_view()),
    path("superadmin/companies/<int:pk>/", SuperAdminCompanyDetailAPIView.as_view()),
    path("superadmin/users/", SuperAdminUserListAPIView.as_view()),
    path("superadmin/users/<int:pk>/", SuperAdminUserDetailAPIView.as_view()),
    path("superadmin/payments/", SuperAdminPaymentsAPIView.as_view()),
]