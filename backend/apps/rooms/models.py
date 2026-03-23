import secrets
import string
import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


def generate_room_code(length: int = 5) -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class Room(models.Model):
    class RoomStatus(models.TextChoices):
        WAITING = "waiting", "Waiting"
        IN_PROGRESS = "in_progress", "In Progress"
        FINISHED = "finished", "Finished"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=5, unique=True, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=RoomStatus.choices,
        default=RoomStatus.WAITING,
    )
    max_players = models.PositiveSmallIntegerField(
        default=6,
        validators=[MinValueValidator(2), MaxValueValidator(6)],
    )
    host = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_room_code()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"Room {self.code}"


class RoomPlayer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="players")
    nickname = models.CharField(max_length=64)
    avatar_color = models.CharField(max_length=20, default="orange")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["room", "nickname"],
                name="unique_room_player_nickname",
            )
        ]

    def __str__(self) -> str:
        return f"{self.nickname} in {self.room.code}"
