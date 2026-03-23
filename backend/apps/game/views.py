from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.game.services import start_game
from apps.rooms.models import Room


class StartGameView(APIView):
    permission_classes = [AllowAny]

    def post(self, _request, room_id: str):
        try:
            room = Room.objects.get(code=room_id)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            state = start_game(room)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"type": "game_state", "game_state": state}, status=status.HTTP_200_OK)
