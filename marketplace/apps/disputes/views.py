from django.db import models

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from apps.contracts.models import Contract

from .models import Dispute
from .serializers import DisputeSerializer


class DisputePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            obj.contract.client == request.user
            or obj.contract.freelancer == request.user
        )


class DisputeViewSet(viewsets.ModelViewSet):
    serializer_class = DisputeSerializer
    permission_classes = [DisputePermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Dispute.objects
            .select_related(
                "contract",
                "contract__project",
                "contract__client",
                "contract__freelancer",
                "opened_by",
                "resolved_by",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(contract__client=user)
            | models.Q(contract__freelancer=user)
        )

    def perform_create(self, serializer):
        contract_id = self.request.data.get("contract")

        contract = (
            Contract.objects
            .select_related(
                "client",
                "freelancer",
            )
            .filter(id=contract_id)
            .first()
        )

        if not contract:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"contract": "Contract not found."}
            )

        if self.request.user not in [
            contract.client,
            contract.freelancer,
        ]:
            raise PermissionDenied(
                "You are not a participant of this contract."
            )

        if contract.status != Contract.Status.ACTIVE:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {
                    "contract": (
                        "Dispute can only be opened "
                        "for an active contract."
                    )
                }
            )

        serializer.save(
            contract=contract,
            opened_by=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def start_review(self, request, pk=None):
        dispute = self.get_object()

        if request.user.role != request.user.Role.ADMIN:
            return Response(
                {
                    "detail": "Only admin can review disputes."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if dispute.status != Dispute.Status.OPEN:
            return Response(
                {
                    "detail": "Dispute must be open."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        dispute.status = Dispute.Status.IN_REVIEW

        dispute.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(dispute).data
        )

    @action(detail=True, methods=["post"])
    def resolve_client(self, request, pk=None):
        return self._resolve(
            request,
            Dispute.Status.RESOLVED_CLIENT,
        )

    @action(detail=True, methods=["post"])
    def resolve_freelancer(self, request, pk=None):
        return self._resolve(
            request,
            Dispute.Status.RESOLVED_FREELANCER,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._resolve(
            request,
            Dispute.Status.REJECTED,
        )

    def _resolve(self, request, resolution_status):
        dispute = self.get_object()

        if request.user.role != request.user.Role.ADMIN:
            return Response(
                {
                    "detail": "Only admin can resolve disputes."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if dispute.status != Dispute.Status.IN_REVIEW:
            return Response(
                {
                    "detail": (
                        "Dispute must be in review "
                        "before resolution."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        resolution = request.data.get("resolution", "")

        dispute.status = resolution_status
        dispute.resolution = resolution
        dispute.resolved_by = request.user

        dispute.save(
            update_fields=[
                "status",
                "resolution",
                "resolved_by",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(dispute).data
        )