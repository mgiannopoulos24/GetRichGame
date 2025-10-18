# backend/game_core/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Map the root path of this app to our view
    path('health/', views.health_check, name='health_check'),
]