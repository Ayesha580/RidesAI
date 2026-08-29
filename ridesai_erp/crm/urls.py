from django.urls import path

from .views import (
    LeadListCreateAPIView,
    LeadDetailAPIView,
    LeadImportAPIView,
BulkDeleteLeadsAPIView,
    ClientListCreateAPIView,
    ClientDetailAPIView,
    ConvertLeadToClientAPIView,
    ClientStatusChangeAPIView,

    DealListCreateAPIView,
    DealDetailAPIView,
    DealStageChangeAPIView,

    CRMDashboardAPIView,
    CRMActivityListCreateAPIView,

    InvoiceListCreateAPIView,
    InvoiceDetailAPIView,
    InvoiceGeneratePDFAPIView,
    InvoiceDownloadPDFAPIView,
    InvoiceSendAPIView,

    CustomFieldListCreateAPIView,
    CustomFieldDetailAPIView,
    CustomFieldValueListCreateAPIView,

    SalesReportAPIView,
    LeadExportAPIView,
)


urlpatterns = [

    # =====================
    # LEADS
    # =====================

    path(
        "leads/",
        LeadListCreateAPIView.as_view(),
        name="lead-list"
    ),
path("leads/bulk-delete/", BulkDeleteLeadsAPIView.as_view(), name="leads-bulk-delete"),

    path(
        "leads/<int:pk>/",
        LeadDetailAPIView.as_view(),
        name="lead-detail"
    ),

    path(
        "leads/import/",
        LeadImportAPIView.as_view(),
        name="lead-import"
    ),

    path(
        "leads/export/",
        LeadExportAPIView.as_view(),
        name="lead-export"
    ),

    path(
        "leads/<int:pk>/convert/",
        ConvertLeadToClientAPIView.as_view(),
        name="lead-convert"
    ),

    # =====================
    # CLIENTS
    # =====================

    path(
        "clients/",
        ClientListCreateAPIView.as_view(),
        name="client-list"
    ),

    path(
        "clients/<int:pk>/",
        ClientDetailAPIView.as_view(),
        name="client-detail"
    ),

    path(
        "clients/<int:pk>/status/",
        ClientStatusChangeAPIView.as_view(),
        name="client-status"
    ),

    # =====================
    # DEALS
    # =====================

    path(
        "deals/",
        DealListCreateAPIView.as_view(),
        name="deal-list"
    ),

    path(
        "deals/<int:pk>/",
        DealDetailAPIView.as_view(),
        name="deal-detail"
    ),

    path(
        "deals/<int:pk>/stage/",
        DealStageChangeAPIView.as_view(),
        name="deal-stage"
    ),

    # =====================
    # DASHBOARD
    # =====================

    path(
        "dashboard/",
        CRMDashboardAPIView.as_view(),
        name="crm-dashboard"
    ),

    # =====================
    # ACTIVITIES
    # =====================

    path(
        "activities/",
        CRMActivityListCreateAPIView.as_view(),
        name="crm-activities"
    ),

    # =====================
    # INVOICES
    # =====================

    path("invoices/", InvoiceListCreateAPIView.as_view()),
    path("invoices/<int:pk>/", InvoiceDetailAPIView.as_view()),
    path("invoices/<int:pk>/generate-pdf/", InvoiceGeneratePDFAPIView.as_view()),
    path("invoices/<int:pk>/download/", InvoiceDownloadPDFAPIView.as_view()),
    path("invoices/<int:pk>/send/", InvoiceSendAPIView.as_view()),

    # =====================
    # CUSTOM FIELDS
    # =====================

    path(
        "custom-fields/",
        CustomFieldListCreateAPIView.as_view(),
        name="custom-fields"
    ),

    path(
        "custom-fields/<int:pk>/",
        CustomFieldDetailAPIView.as_view(),
        name="custom-field-detail"
    ),

    path(
        "custom-field-values/",
        CustomFieldValueListCreateAPIView.as_view(),
        name="custom-field-values"
    ),

    # =====================
    # REPORTS
    # =====================

    path(
        "reports/sales/",
        SalesReportAPIView.as_view(),
        name="sales-report"
    ),
]