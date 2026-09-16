import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Q

from base.models import Conversation, Message
from base.serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.group_name = f'chat_{self.conversation_id}'
        user = self.scope['user']

        if user.is_anonymous or not await self.is_participant(user, self.conversation_id):
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = (data.get('text') or '').strip()
        if not text:
            return

        user = self.scope['user']
        message = await self.save_message(self.conversation_id, user, text)

        await self.channel_layer.group_send(
            self.group_name,
            {'type': 'chat.message', 'message': message}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def is_participant(self, user, conversation_id):
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user), id=conversation_id
        ).exists()

    @database_sync_to_async
    def save_message(self, conversation_id, user, text):
        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(conversation=conversation, sender=user, text=text)
        return MessageSerializer(message).data
