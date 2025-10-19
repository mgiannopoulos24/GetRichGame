# app/core/models.py
from pydantic import BaseModel, Field


# Base message structure for all messages sent over the WebSocket
class BaseWsMessage(BaseModel):
    type: str = Field(description="The type of the message (e.g., 'status', 'echo')")


# Model for the initial welcome message from the server
class StatusMessage(BaseWsMessage):
    type: str = "status"
    message: str = Field(description="A descriptive status message.")


# Model for a message received from the client
class ClientMessage(BaseModel):
    message: str = Field(description="The actual message content from the client.")


# Model for the server's echo response
class EchoResponse(BaseWsMessage):
    type: str = "echo"
    client_message: str = Field(
        description="The original message received from the client."
    )
    server_response: str = Field(description="The server's processed response.")
