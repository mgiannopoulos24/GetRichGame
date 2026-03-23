from django.db import migrations, models
import django.core.validators
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Room",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "code",
                    models.CharField(db_index=True, max_length=5, unique=True),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("waiting", "Waiting"),
                            ("in_progress", "In Progress"),
                            ("finished", "Finished"),
                        ],
                        default="waiting",
                        max_length=20,
                    ),
                ),
                (
                    "max_players",
                    models.PositiveSmallIntegerField(
                        default=6,
                        validators=[
                            django.core.validators.MinValueValidator(2),
                            django.core.validators.MaxValueValidator(6),
                        ],
                    ),
                ),
                ("host", models.CharField(blank=True, max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="RoomPlayer",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("nickname", models.CharField(max_length=64)),
                ("avatar_color", models.CharField(default="orange", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "room",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="players",
                        to="rooms.room",
                    ),
                ),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("room", "nickname"),
                        name="unique_room_player_nickname",
                    )
                ],
            },
        ),
    ]
