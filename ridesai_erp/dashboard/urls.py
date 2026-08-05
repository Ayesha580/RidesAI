from django.urls import path
from . import views

urlpatterns = [
    path('owner/', views.OwnerDashboardAPIView.as_view(), name='api-dashboard-owner'),
    path('hr/', views.HRDashboardAPIView.as_view(), name='api-dashboard-hr'),
    path('employee/', views.EmployeeDashboardAPIView.as_view(), name='api-dashboard-employee'),
    path('manager/', views.ManagerDashboardAPIView.as_view(), name='api-dashboard-manager'),
    path('accountant/', views.AccountantDashboardAPIView.as_view(), name='api-dashboard-accountant'),
    path('crm/', views.CRMDashboardAPIView.as_view(), name='api-dashboard-crm'),
]