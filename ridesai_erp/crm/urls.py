from django.urls import path
from .views import (
    LeadListCreateAPIView,
    LeadDetailAPIView,
    LeadImportAPIView,
)

app_name = 'crm'

urlpatterns = [
    path('leads/', LeadListCreateAPIView.as_view(), name='lead-list'),
    path('leads/<int:pk>/', LeadDetailAPIView.as_view(), name='lead-detail'),
    path('leads/import/', LeadImportAPIView.as_view(), name='lead-import'),
]