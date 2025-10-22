import json
import secrets  # New import for secure ID generation
import string  # New import for ID generation

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from fastapi.responses import PlainTextResponse, JSONResponse
from .models import StatusMessage, ClientMessage, EchoResponse, RoomCreationResponse


# --- Helper Function (Simulated Room ID Generation) ---
def generate_unique_room_id(length: int = 5) -> str:
    """Generates a secure, 5-char alphanumeric ID."""
    alphabet = string.ascii_lowercase + string.digits
    while True:
        room_id = "".join(secrets.choice(alphabet) for _ in range(length))
        # In a real app, this is where you'd check a DB/cache for uniqueness.
        return room_id


router = APIRouter(prefix="/api/v1")


@router.post(
    "/rooms/create/",
    response_model=RoomCreationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_room():
    """
    Creates a new game room, generates a unique ID, and returns it.
    """
    new_room_id = generate_unique_room_id()

    print(f"New room created with ID: {new_room_id}")

    return JSONResponse(
        content={"room_id": new_room_id}, status_code=status.HTTP_201_CREATED
    )


@router.get(
    "/health/", response_class=PlainTextResponse, status_code=status.HTTP_200_OK
)
def health_check():
    """
    Simple health check endpoint.
    """

    return "ok bro\n"


@router.websocket("/ws/game/")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str = Query(..., min_length=5, max_length=5, regex="^[A-Z0-9]{5}$"),
):

    print(f"Attempting connection for room: {room_id}")

    await websocket.accept()
    print(f"WebSocket connection established for room: {room_id}")

    welcome_msg = StatusMessage(
        message=f"Welcome to room {room_id}! Connection to FastAPI WebSocket successful."
    ).model_dump_json()

    await websocket.send_text(welcome_msg)

    try:

        while True:

            data = await websocket.receive_json()

            try:
                client_message = ClientMessage(**data)
                message = client_message.message
            except Exception as e:
                print(f"Error parsing client message: {e}")
                message = "Invalid message format."
                await websocket.send_text(
                    StatusMessage(
                        message=f'Invalid message format received. Expected \'{{ "message": "..." }}\'.'
                    ).model_dump_json()
                )
                continue

            print(f"Received message from room {room_id}: {message}")

            response = EchoResponse(
                client_message=message,
                server_response=f"Server heard: '{message}' in room '{room_id}'",
            ).model_dump_json()

            await websocket.send_text(response)

    except WebSocketDisconnect:
        print(f"WebSocket connection closed for room: {room_id}")
    except Exception as e:
        print(f"An unexpected error occurred in room {room_id}: {e}")
        await websocket.close()
