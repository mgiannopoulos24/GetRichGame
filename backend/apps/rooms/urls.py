from django.urls import path

from apps.rooms.views import (
    CreateRoomView,
    HealthCheckView,
    JoinRoomView,
    RoomDetailView,
    RoomListView,
)

urlpatterns = [
    path("rooms/", RoomListView.as_view(), name="room-list"),
    path("rooms/<str:room_id>/", RoomDetailView.as_view(), name="room-detail"),
    path("rooms/create/", CreateRoomView.as_view(), name="room-create"),
    path("rooms/<str:room_id>/join/", JoinRoomView.as_view(), name="room-join"),
    path("health/", HealthCheckView.as_view(), name="health"),
]
