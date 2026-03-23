from django.urls import path

from apps.game.views import StartGameView

urlpatterns = [
    path("game/<str:room_id>/start/", StartGameView.as_view(), name="game-start"),
]
