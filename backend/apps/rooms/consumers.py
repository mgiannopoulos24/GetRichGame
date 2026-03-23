import re
from urllib.parse import parse_qs

from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from apps.game.models import GameState
from apps.game.services import get_or_create_state, process_action
from apps.rooms.models import Room, RoomPlayer


class GameConsumer(JsonWebsocketConsumer):
    ROOM_ID_REGEX = re.compile(r"^[a-zA-Z0-9]{5}$")

    def connect(self):
        query_string = self.scope["query_string"].decode("utf-8")
        query_params = parse_qs(query_string)
        room_id = query_params.get("room_id", [""])[0]
        nickname = query_params.get("nickname", ["guest"])[0]
        if not self.ROOM_ID_REGEX.match(room_id):
            self.close(code=4001)
            return

        try:
            self.room = Room.objects.get(code=room_id)
        except Room.DoesNotExist:
            self.close(code=4404)
            return

        self.room_id = room_id
        self.nickname = nickname
        self.group_name = f"room_{room_id}"
        self.player, _ = RoomPlayer.objects.get_or_create(
            room=self.room,
            nickname=self.nickname,
            defaults={"avatar_color": "orange"},
        )

        async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        self.accept()
        self.send_json(
            {
                "type": "room_state",
                "room_id": self.room_id,
                "game_state": self._room_state(),
            }
        )
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "player_joined",
                "player": {
                    "nickname": self.player.nickname,
                    "avatar_color": self.player.avatar_color,
                },
                "game_state": self._room_state(),
            },
        )

    def receive_json(self, content, **kwargs):
        action_type = content.get("type")
        if isinstance(action_type, str):
            try:
                state = process_action(self.room, self.nickname, action_type)
            except ValueError as exc:
                self.send_json(
                    {"type": "error", "code": "INVALID_ACTION", "message": str(exc)}
                )
                return

            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type": "game_state",
                    "game_state": state,
                },
            )
            return

        message = content.get("message")
        if isinstance(message, str):
            self.send_json(
                {
                    "type": "echo",
                    "client_message": message,
                    "server_response": (
                        f"Server heard: '{message}' in room '{self.room_id}'"
                    ),
                }
            )
            return

        self.send_json(
            {
                "type": "status",
                "message": 'Invalid message format. Expected { "type": "action" }.',
            }
        )

    def disconnect(self, code):
        if not hasattr(self, "group_name"):
            return

        RoomPlayer.objects.filter(room=self.room, nickname=self.nickname).delete()
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "player_left",
                "player": {"nickname": self.nickname},
                "game_state": self._room_state(),
            },
        )
        async_to_sync(self.channel_layer.group_discard)(self.group_name, self.channel_name)

    def player_joined(self, event):
        self.send_json(
            {
                "type": "player_joined",
                "player": event["player"],
                "game_state": event["game_state"],
            }
        )

    def player_left(self, event):
        self.send_json(
            {
                "type": "player_left",
                "player": event["player"],
                "game_state": event["game_state"],
            }
        )

    def game_state(self, event):
        self.send_json(
            {
                "type": "game_state",
                "game_state": event["game_state"],
            }
        )

    def _room_state(self):
        self.room.refresh_from_db()
        state = GameState.objects.filter(room=self.room).first()
        if state and state.state:
            return state.state

        fallback_state = get_or_create_state(self.room)
        players = list(
            self.room.players.order_by("created_at").values("nickname", "avatar_color")
        )
        fallback_state["players"] = players
        fallback_state["player_count"] = len(players)
        return fallback_state
