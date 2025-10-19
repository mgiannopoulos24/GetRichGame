import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.responses import PlainTextResponse
from .models import StatusMessage, ClientMessage, EchoResponse

router = APIRouter(prefix="/api/v1")


@router.get(
    "/health/", response_class=PlainTextResponse, status_code=status.HTTP_200_OK
)
def health_check():
    """
    Simple health check endpoint.
    """

    return "ok bro\n"


@router.websocket("/ws/game/")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    print("WebSocket connection established.")

    welcome_msg = StatusMessage(
        message="Welcome! Connection to FastAPI WebSocket successful."
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

            print(f"Received message from client: {message}")

            response = EchoResponse(
                client_message=message, server_response=f"Server heard: '{message}'"
            ).model_dump_json()

            await websocket.send_text(response)

    except WebSocketDisconnect:
        print("WebSocket connection closed.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        await websocket.close()
