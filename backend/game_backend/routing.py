from django.urls import re_path
from game_core.consumers import SimpleGameConsumer

# Defines the connection type and path
websocket_urlpatterns = [
    # The URL will be 'ws://YOUR_DOMAIN/ws/game/'
    re_path(r'ws/game/$', SimpleGameConsumer.as_asgi()),
]