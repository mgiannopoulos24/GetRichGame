from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.rooms.models import Room, RoomPlayer


class TestRoomViews(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_room_persists_and_returns_room_id(self):
        response = self.client.post(reverse("room-create"), format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("room_id", response.data)
        self.assertTrue(Room.objects.filter(code=response.data["room_id"]).exists())

    def test_room_list_returns_only_open_non_expired_rooms(self):
        active_room = Room.objects.create(status=Room.RoomStatus.WAITING)
        RoomPlayer.objects.create(room=active_room, nickname="alice")

        expired_room = Room.objects.create(status=Room.RoomStatus.WAITING)
        Room.objects.filter(pk=expired_room.pk).update(
            updated_at=timezone.now() - timedelta(minutes=31)
        )
        Room.objects.create(status=Room.RoomStatus.IN_PROGRESS)

        response = self.client.get(reverse("room-list"), {"page": 1, "page_size": 10})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["room_id"], active_room.code)
        self.assertEqual(response.data["results"][0]["player_count"], 1)

    def test_room_detail_returns_single_room(self):
        room = Room.objects.create(status=Room.RoomStatus.WAITING, host="bob")
        RoomPlayer.objects.create(room=room, nickname="bob", avatar_color="blue")

        response = self.client.get(reverse("room-detail", kwargs={"room_id": room.code}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["room_id"], room.code)
        self.assertEqual(response.data["host"], "bob")
        self.assertEqual(response.data["player_count"], 1)

    def test_join_room_adds_player(self):
        room = Room.objects.create(status=Room.RoomStatus.WAITING, max_players=2)

        response = self.client.post(
            reverse("room-join", kwargs={"room_id": room.code}),
            {"nickname": "alice", "avatar_color": "green"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(RoomPlayer.objects.filter(room=room, nickname="alice").exists())
        self.assertEqual(response.data["player_count"], 1)

    def test_join_room_rejects_when_full(self):
        room = Room.objects.create(status=Room.RoomStatus.WAITING, max_players=1)
        RoomPlayer.objects.create(room=room, nickname="host")

        response = self.client.post(
            reverse("room-join", kwargs={"room_id": room.code}),
            {"nickname": "alice"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["detail"], "Room is full")
