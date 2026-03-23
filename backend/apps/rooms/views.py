from datetime import timedelta

from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rooms.models import Room, RoomPlayer
from apps.rooms.serializers import (
    JoinRoomRequestSerializer,
    RoomCreationResponseSerializer,
    RoomSerializer,
)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request):
        return HttpResponse("ok bro\n", content_type="text/plain")


class CreateRoomView(APIView):
    permission_classes = [AllowAny]

    def post(self, _request):
        room = Room.objects.create(host="host")
        serializer = RoomCreationResponseSerializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoomListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            page = max(int(request.query_params.get("page", 1)), 1)
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = max(min(int(request.query_params.get("page_size", 10)), 50), 1)
        except (TypeError, ValueError):
            page_size = 10
        offset = (page - 1) * page_size

        active_threshold = timezone.now() - timedelta(minutes=30)
        queryset = (
            Room.objects.filter(status=Room.RoomStatus.WAITING, updated_at__gte=active_threshold)
            .annotate(player_count=Count("players"))
            .order_by("-created_at")
        )
        total = queryset.count()
        paginated = queryset[offset : offset + page_size]
        serializer = RoomSerializer(paginated, many=True)
        return Response(
            {
                "count": total,
                "page": page,
                "page_size": page_size,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RoomDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request, room_id: str):
        try:
            room = Room.objects.annotate(player_count=Count("players")).get(code=room_id)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)


class JoinRoomView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, room_id: str):
        serializer = JoinRoomRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            room = Room.objects.annotate(player_count=Count("players")).get(code=room_id)
        except Room.DoesNotExist:
            return Response({"detail": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

        if room.status != Room.RoomStatus.WAITING:
            return Response(
                {"detail": "Room is not open for joining"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if room.player_count >= room.max_players:
            return Response({"detail": "Room is full"}, status=status.HTTP_400_BAD_REQUEST)

        RoomPlayer.objects.create(
            room=room,
            nickname=serializer.validated_data["nickname"],
            avatar_color=serializer.validated_data["avatar_color"],
        )
        room.updated_at = timezone.now()
        room.save(update_fields=["updated_at"])

        refreshed_room = Room.objects.annotate(player_count=Count("players")).get(pk=room.pk)
        response_serializer = RoomSerializer(refreshed_room)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
