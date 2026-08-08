# companies/urls.py  (NEW FILE)

from django.urls import path
from . import views

app_name = "companies"

urlpatterns = [
    path("api/plans/", views.PlanListAPIView.as_view(), name="api-plan-list"),
    path("api/select-plan/", views.SelectPlanAPIView.as_view(), name="api-select-plan"),

]

# =========================================================
# aur config/urls.py mein yeh line add karein (companies app pehle
# se INSTALLED_APPS mein hai, bas urls.py include karna hai):
#
#   path('companies/', include('companies.urls')),
#
# =========================================================
