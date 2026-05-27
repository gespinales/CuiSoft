from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularSwaggerView
from .schema import SafeSpectacularAPIView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SafeSpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("api/auth/", include("accounts.urls")),
    path("api/animals/", include("animals.urls")),
    path("api/reproduction/", include("reproduction.urls")),
    path("api/health/", include("health.urls")),
    path("api/feeding/", include("feeding.urls")),
    path("api/sales/", include("sales.urls")),
    path("api/reports/", include("reports.urls")),
]
