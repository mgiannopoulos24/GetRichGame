from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path


def ping(_request):
    return HttpResponse("pong!\n", content_type="text/plain")


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.rooms.urls")),
    path("api/v1/", include("apps.game.urls")),
    path("ping", ping),
]
