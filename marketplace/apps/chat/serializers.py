from rest_framework import serializers

from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.ReadOnlyField(
        source="sender.username"
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "chat",
            "sender",
            "text",
            "is_read",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "is_read",
            "created_at",
            "updated_at",
        ]


class ChatSerializer(serializers.ModelSerializer):
    client = serializers.ReadOnlyField(
        source="client.username"
    )

    freelancer = serializers.ReadOnlyField(
        source="freelancer.username"
    )

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Chat

        fields = [
            "id",
            "client",
            "freelancer",
            "contract",
            "last_message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "client",
            "freelancer",
            "last_message",
            "created_at",
            "updated_at",
        ]

    def get_last_message(self, obj):
        message = (
            obj.messages
            .select_related("sender")
            .order_by("-created_at")
            .first()
        )

        if not message:
            return None

        return {
            "id": message.id,
            "sender": message.sender.username,
            "text": message.text,
            "created_at": message.created_at,
        }