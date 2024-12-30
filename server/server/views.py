from rest_framework.views import APIView
from rest_framework import status
from django.http import HttpResponse


class HealthCheckView(APIView):
    permission_classes = []

    def get(self, request):
        response = HttpResponse("OK", content_type="text/plain")
        response.status_code = status.HTTP_200_OK
        return response
