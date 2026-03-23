from django.urls import re_path

from apps.rooms.consumers import GameConsumer

websocket_urlpatterns = [
    re_path(r"^api/v1/ws/game/$", GameConsumer.as_asgi()),
]
