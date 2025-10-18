# backend/game_core/consumers.py

from channels.generic.websocket import WebsocketConsumer
import json

class SimpleGameConsumer(WebsocketConsumer):
    
    def connect(self):
        # 1. Open the connection
        print("WebSocket connection established.")
        self.accept()

        # Send an initial message to the client
        self.send(text_data=json.dumps({
            'type': 'status',
            'message': "Welcome! Connection to Django Channels successful."
        }))

    def receive(self, text_data=None, bytes_data=None):
        # 2. Handle incoming data
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', 'No message content.')

        print(f"Received message from client: {message}")

        # Echo the message back to the client
        self.send(text_data=json.dumps({
            'type': 'echo',
            'client_message': message,
            'server_response': f"Server heard: '{message}'"
        }))

    def disconnect(self, close_code):
        # 3. Close the connection
        print("WebSocket connection closed.")
        pass