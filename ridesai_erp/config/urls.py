from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('admin/', admin.site.urls),         
    path(
        "api/",
        include("accounts.urls")
    ),
    path(
            "api/herry/",
            include("herry.urls")
        ),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/support/', include('support.urls')),

    path('api/crm/', include('crm.urls')),
    path(
            "api/hr/",
            include("hr.urls")
        ),
    path(
        "api/billing/",
        include("billing.urls")
    ),
    path("api/chat/", include("chat.urls")),
    path("api/integrations/", include("integrations.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)