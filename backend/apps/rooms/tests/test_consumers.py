from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase, override_settings

from apps.rooms.models import Room
from config.asgi import application


@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
class TestGameConsumer(TransactionTestCase):
    def setUp(self):
        self.room = Room.objects.create(status=Room.RoomStatus.WAITING, host="host")

    @staticmethod
    async def _receive_until_type(communicator: WebsocketCommunicator, event_type: str):
        for _ in range(4):
            payload = await communicator.receive_json_from(timeout=1)
            if payload.get("type") == event_type:
                return payload
        raise AssertionError(f"Event {event_type} not received")

    def test_connect_sends_current_room_state(self):
        async def scenario():
            communicator = WebsocketCommunicator(
                application,
                f"/api/v1/ws/game/?room_id={self.room.code}&nickname=alice",
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)

            state_event = await self._receive_until_type(communicator, "room_state")
            self.assertEqual(state_event["room_id"], self.room.code)
            self.assertEqual(state_event["game_state"]["player_count"], 1)
            self.assertEqual(
                state_event["game_state"]["players"][0]["nickname"],
                "alice",
            )

            await communicator.disconnect()

        async_to_sync(scenario)()

    def test_broadcasts_join_and_leave_events(self):
        async def scenario():
            alice = WebsocketCommunicator(
                application,
                f"/api/v1/ws/game/?room_id={self.room.code}&nickname=alice",
            )
            connected, _ = await alice.connect()
            self.assertTrue(connected)
            await self._receive_until_type(alice, "room_state")
            await self._receive_until_type(alice, "player_joined")

            bob = WebsocketCommunicator(
                application,
                f"/api/v1/ws/game/?room_id={self.room.code}&nickname=bob",
            )
            connected, _ = await bob.connect()
            self.assertTrue(connected)
            await self._receive_until_type(bob, "room_state")

            joined_event_for_alice = await self._receive_until_type(alice, "player_joined")
            self.assertEqual(joined_event_for_alice["player"]["nickname"], "bob")
            self.assertEqual(joined_event_for_alice["game_state"]["player_count"], 2)

            await bob.disconnect()
            left_event_for_alice = await self._receive_until_type(alice, "player_left")
            self.assertEqual(left_event_for_alice["player"]["nickname"], "bob")
            self.assertEqual(left_event_for_alice["game_state"]["player_count"], 1)

            await alice.disconnect()

        async_to_sync(scenario)()
