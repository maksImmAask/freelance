import json

from django.db import models

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Chat, Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.user = self.scope.get("user")

        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        allowed = await self.user_can_access_chat()

        if not allowed:
            await self.close(code=4003)
            return

        self.room_group_name = f"chat_{self.chat_id}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_text = data.get("message")

        if not isinstance(message_text, str):
            return

        message_text = message_text.strip()

        if not message_text:
            return

        if len(message_text) > 5000:
            return

        message = await self.create_message(message_text)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "id": event["message"]["id"],
                    "chat": int(self.chat_id),
                    "sender": event["message"]["sender"],
                    "text": event["message"]["text"],
                    "created_at": event["message"]["created_at"],
                }
            )
        )

    @database_sync_to_async
    def user_can_access_chat(self):
        return Chat.objects.filter(
            id=self.chat_id,
        ).filter(
            models.Q(client=self.user)
            | models.Q(freelancer=self.user)
            | models.Q(
                client=self.user,
            )
        ).exists() or self.user.role == self.user.Role.ADMIN

    @database_sync_to_async
    def create_message(self, text):
        message = Message.objects.create(
            chat_id=self.chat_id,
            sender=self.user,
            text=text,
        )

        return {
            "id": message.id,
            "sender": self.user.username,
            "text": message.text,
            "created_at": message.created_at.isoformat(),
        }