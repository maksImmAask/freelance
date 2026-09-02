from django.db import models

from rest_framework import status, viewsets
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer


class ReviewPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            obj.author == request.user
            or obj.recipient == request.user
        )


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [ReviewPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Review.objects
            .select_related(
                "contract",
                "contract__project",
                "author",
                "recipient",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(author=user)
            | models.Q(recipient=user)
        )

    def perform_create(self, serializer):
        contract_id = self.request.data.get("contract")

        contract = (
            self._get_contract(contract_id)
        )

        if not contract:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {
                    "contract": "Contract not found."
                }
            )

        if contract.status != contract.Status.COMPLETED:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {
                    "contract": (
                        "Review can only be created "
                        "for a completed contract."
                    )
                }
            )

        if self.request.user == contract.client:
            recipient = contract.freelancer

        elif self.request.user == contract.freelancer:
            recipient = contract.client

        else:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You are not a participant of this contract."
            )

        serializer.save(
            author=self.request.user,
            recipient=recipient,
            contract=contract,
        )

    def _get_contract(self, contract_id):
        from apps.contracts.models import Contract

        return (
            Contract.objects
            .select_related(
                "client",
                "freelancer",
            )
            .filter(id=contract_id)
            .first()
        )

    def update(self, request, *args, **kwargs):
        review = self.get_object()

        if review.author != request.user:
            return Response(
                {
                    "detail": (
                        "Only the review author "
                        "can edit the review."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(
            request,
            *args,
            **kwargs,
        )

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()

        if (
            review.author != request.user
            and request.user.role != request.user.Role.ADMIN
        ):
            return Response(
                {
                    "detail": (
                        "Only the author or admin "
                        "can delete the review."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(
            request,
            *args,
            **kwargs,
        )