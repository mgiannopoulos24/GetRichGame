from rest_framework import serializers

from apps.rooms.models import Room, RoomPlayer


class RoomCreationResponseSerializer(serializers.ModelSerializer):
    room_id = serializers.CharField(source="code")

    class Meta:
        model = Room
        fields = ["room_id"]


class RoomPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomPlayer
        fields = ["nickname", "avatar_color", "created_at"]


class RoomSerializer(serializers.ModelSerializer):
    room_id = serializers.CharField(source="code")
    player_count = serializers.IntegerField(read_only=True)
    players = RoomPlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            "id",
            "room_id",
            "status",
            "max_players",
            "host",
            "created_at",
            "player_count",
            "players",
        ]


class JoinRoomRequestSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=64)
    avatar_color = serializers.CharField(max_length=20, required=False, default="orange")
