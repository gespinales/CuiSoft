from drf_spectacular.views import SpectacularAPIView


class SafeSpectacularAPIView(SpectacularAPIView):
    def _get_schema_response(self, request):
        response = super()._get_schema_response(request)
        response["Content-Disposition"] = "inline"
        return response
