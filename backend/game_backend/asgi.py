# backend/game_backend/asgi.py

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from . import routing # Import the routing file we just created

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_backend.settings')

# Get the standard ASGI application for HTTP requests
django_asgi_app = get_asgi_application()

# Define the ProtocolTypeRouter:
application = ProtocolTypeRouter({
  # 1. Route standard HTTP requests to the normal Django application
  "http": django_asgi_app,
  
  # 2. Route WebSocket requests through the middleware and then to our routing file
  "websocket": AuthMiddlewareStack(
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})