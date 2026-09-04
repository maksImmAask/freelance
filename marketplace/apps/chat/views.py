from django.db import models # pyright: ignore[reportMissingModuleSource]

from rest_framework import status, viewsets # type: ignore
from rest_framework.decorators import action # type: ignore
from rest_framework.permissions import BasePermission # type: ignore
from rest_framework.response import Response # type: ignore

from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer


class ChatPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            obj.client == request.user
            or obj.freelancer == request.user
        )


class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [ChatPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Chat.objects
            .select_related(
                "client",
                "freelancer",
                "contract",
            )
            .prefetch_related("messages")
            .order_by("-updated_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(client=user)
            | models.Q(freelancer=user)
        )

    def create(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "Use the create-chat endpoint "
                    "to create a chat."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=["post"])
    def create_chat(self, request):
        client_id = request.data.get("client")
        freelancer_id = request.data.get("freelancer")

        if not client_id or not freelancer_id:
            return Response(
                {
                    "detail": (
                        "client and freelancer are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.user.role == request.user.Role.CLIENT:
            if str(request.user.id) != str(client_id):
                return Response(
                    {
                        "detail": (
                            "You can only create a chat "
                            "for yourself."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        elif request.user.role != request.user.Role.ADMIN:
            return Response(
                {
                    "detail": (
                        "Only client or admin "
                        "can create a chat."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        from django.contrib.auth import get_user_model

        User = get_user_model()

        try:
            client = User.objects.get(
                id=client_id,
                role=User.Role.CLIENT,
            )

            freelancer = User.objects.get(
                id=freelancer_id,
                role=User.Role.FREELANCER,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "detail": "Client or freelancer not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        chat, created = Chat.objects.get_or_create(
            client=client,
            freelancer=freelancer,
        )

        return Response(
            {
                "created": created,
                "chat": ChatSerializer(chat).data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class MessagePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            obj.chat.client == request.user
            or obj.chat.freelancer == request.user
        )


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [MessagePermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Message.objects
            .select_related(
                "chat",
                "sender",
            )
            .order_by("created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(chat__client=user)
            | models.Q(chat__freelancer=user)
        )

    def perform_create(self, serializer):
        chat_id = self.request.data.get("chat")

        chat = (
            Chat.objects
            .filter(id=chat_id)
            .first()
        )

        if not chat:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"chat": "Chat not found."}
            )

        if self.request.user not in [
            chat.client,
            chat.freelancer,
        ]:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You are not a participant of this chat."
            )

        serializer.save(
            sender=self.request.user
        )

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        message = self.get_object()

        if message.sender == request.user:
            return Response(
                {
                    "detail": (
                        "You cannot mark your own "
                        "message as read."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        message.is_read = True

        message.save(
            update_fields=["is_read"]
        )

        return Response(
            self.get_serializer(message).data
        )