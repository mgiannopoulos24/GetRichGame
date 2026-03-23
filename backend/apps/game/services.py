import random
from datetime import timedelta

from django.utils import timezone

from apps.game.models import GameState
from apps.rooms.models import Room

BOARD_TILE_COUNT = 40
START_BALANCE = 1500
GO_REWARD = 200
JAIL_INDEX = 10
JAIL_FINE = 50
TURN_TIMEOUT_SECONDS = 60


def _build_board():
    board = []
    special_tiles = {
        0: ("go", "GO", 0, 0),
        4: ("tax", "Income Tax", 200, 0),
        10: ("jail", "Jail", 0, 0),
        20: ("free_parking", "Free Parking", 0, 0),
        30: ("go_to_jail", "Go To Jail", 0, 0),
    }
    railroads = {5, 15, 25, 35}
    utilities = {12, 28}
    chance = {7, 22, 36}
    community = {2, 17, 33}

    for index in range(BOARD_TILE_COUNT):
        if index in special_tiles:
            tile_type, name, price, rent = special_tiles[index]
        elif index in railroads:
            tile_type, name, price, rent = ("railroad", f"Railroad {index}", 200, 25)
        elif index in utilities:
            tile_type, name, price, rent = ("utility", f"Utility {index}", 150, 20)
        elif index in chance:
            tile_type, name, price, rent = ("chance", "Chance", 0, 0)
        elif index in community:
            tile_type, name, price, rent = ("community_chest", "Community Chest", 0, 0)
        else:
            tile_type, name, price, rent = ("property", f"Property {index}", 100 + (index % 10) * 10, 20)

        board.append(
            {
                "index": index,
                "name": name,
                "type": tile_type,
                "price": price,
                "rent": rent,
                "owner": None,
                "color_group": f"group_{index % 8}" if tile_type == "property" else None,
            }
        )
    return board


def _turn_deadline():
    return (timezone.now() + timedelta(seconds=TURN_TIMEOUT_SECONDS)).isoformat()


def _base_state_for_room(room: Room):
    players = list(room.players.order_by("created_at").values("nickname", "avatar_color"))
    return {
        "room_id": room.code,
        "status": room.status,
        "max_players": room.max_players,
        "host": room.host,
        "players": players,
        "player_count": len(players),
        "board": [],
        "current_player_index": 0,
        "dice": [0, 0],
        "phase": "lobby",
        "log": [],
        "turn_deadline": _turn_deadline(),
    }


def get_or_create_state(room: Room):
    game_state, _ = GameState.objects.get_or_create(room=room, defaults={"state": _base_state_for_room(room)})
    state = game_state.state or _base_state_for_room(room)
    state["players"] = list(room.players.order_by("created_at").values("nickname", "avatar_color"))
    state["player_count"] = len(state["players"])
    state["status"] = room.status
    game_state.state = state
    game_state.save(update_fields=["state", "updated_at"])
    return state


def start_game(room: Room):
    players = list(room.players.order_by("created_at"))
    if len(players) < 2:
        raise ValueError("At least 2 players are required to start.")

    room.status = Room.RoomStatus.IN_PROGRESS
    room.save(update_fields=["status", "updated_at"])

    state_players = [
        {
            "nickname": player.nickname,
            "avatar_color": player.avatar_color,
            "position": 0,
            "balance": START_BALANCE,
            "owned_properties": [],
            "in_jail": False,
            "jail_cards": 0,
        }
        for player in players
    ]

    state = {
        "room_id": room.code,
        "status": room.status,
        "max_players": room.max_players,
        "host": room.host,
        "players": state_players,
        "player_count": len(state_players),
        "board": _build_board(),
        "current_player_index": 0,
        "dice": [0, 0],
        "phase": "rolling",
        "log": ["Game started"],
        "turn_deadline": _turn_deadline(),
    }
    game_state, _ = GameState.objects.get_or_create(room=room)
    game_state.state = state
    game_state.save(update_fields=["state", "updated_at"])
    return state


def _advance_turn(state: dict):
    player_count = len(state["players"])
    state["current_player_index"] = (state["current_player_index"] + 1) % player_count
    state["phase"] = "rolling"
    state["turn_deadline"] = _turn_deadline()


def _apply_turn_timeout(state: dict):
    deadline = state.get("turn_deadline")
    if not deadline:
        return
    now = timezone.now()
    if now >= timezone.datetime.fromisoformat(deadline):
        state["log"].append("Turn timed out. Auto pass.")
        _advance_turn(state)


def _current_player(state: dict):
    return state["players"][state["current_player_index"]]


def process_action(room: Room, nickname: str, action_type: str):
    game_state = GameState.objects.filter(room=room).first()
    if not game_state or not game_state.state or not game_state.state.get("board"):
        raise ValueError("Game has not started.")

    state = game_state.state
    _apply_turn_timeout(state)

    current_player = _current_player(state)
    if current_player["nickname"] != nickname:
        raise ValueError("NOT_YOUR_TURN")

    if action_type == "roll_dice":
        die_one = random.randint(1, 6)
        die_two = random.randint(1, 6)
        total = die_one + die_two
        old_position = current_player["position"]
        new_position = (old_position + total) % BOARD_TILE_COUNT
        current_player["position"] = new_position
        state["dice"] = [die_one, die_two]
        if old_position + total >= BOARD_TILE_COUNT:
            current_player["balance"] += GO_REWARD
            state["log"].append(f"{nickname} collected ${GO_REWARD} by passing GO.")
        if new_position == 30:
            current_player["position"] = JAIL_INDEX
            current_player["in_jail"] = True
            state["log"].append(f"{nickname} rolled to Go To Jail.")
        state["phase"] = "action"
        state["turn_deadline"] = _turn_deadline()
        state["log"].append(f"{nickname} rolled {die_one}+{die_two}.")

    elif action_type == "buy_property":
        tile = state["board"][current_player["position"]]
        if tile["type"] not in {"property", "railroad", "utility"} or tile["owner"]:
            raise ValueError("Cannot buy this tile.")
        if current_player["balance"] < tile["price"]:
            raise ValueError("Insufficient funds.")
        current_player["balance"] -= tile["price"]
        tile["owner"] = nickname
        current_player["owned_properties"].append(tile["index"])
        state["phase"] = "action"
        state["log"].append(f"{nickname} bought {tile['name']} for ${tile['price']}.")

    elif action_type == "pay_rent":
        tile = state["board"][current_player["position"]]
        owner = tile.get("owner")
        if not owner or owner == nickname:
            raise ValueError("No rent to pay.")
        rent = tile["rent"]
        current_player["balance"] -= rent
        for player in state["players"]:
            if player["nickname"] == owner:
                player["balance"] += rent
                break
        state["phase"] = "action"
        state["log"].append(f"{nickname} paid ${rent} rent to {owner}.")

    elif action_type == "pass_turn":
        state["log"].append(f"{nickname} passed turn.")
        _advance_turn(state)

    elif action_type == "go_to_jail":
        current_player["position"] = JAIL_INDEX
        current_player["in_jail"] = True
        state["phase"] = "action"
        state["log"].append(f"{nickname} went to jail.")

    elif action_type == "pay_jail_fine":
        if not current_player["in_jail"]:
            raise ValueError("Player is not in jail.")
        if current_player["balance"] < JAIL_FINE:
            raise ValueError("Insufficient funds.")
        current_player["balance"] -= JAIL_FINE
        current_player["in_jail"] = False
        state["phase"] = "action"
        state["log"].append(f"{nickname} paid jail fine (${JAIL_FINE}).")

    elif action_type == "use_jail_card":
        if current_player["jail_cards"] <= 0:
            raise ValueError("No jail card available.")
        current_player["jail_cards"] -= 1
        current_player["in_jail"] = False
        state["phase"] = "action"
        state["log"].append(f"{nickname} used a jail card.")

    elif action_type == "collect_go":
        current_player["balance"] += GO_REWARD
        state["phase"] = "action"
        state["log"].append(f"{nickname} collected ${GO_REWARD}.")

    else:
        raise ValueError("UNKNOWN_ACTION")

    state["log"] = state["log"][-20:]
    room.status = Room.RoomStatus.IN_PROGRESS
    room.save(update_fields=["status", "updated_at"])
    state["status"] = room.status
    game_state.state = state
    game_state.save(update_fields=["state", "updated_at"])
    return state
