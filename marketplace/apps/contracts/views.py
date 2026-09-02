from django.db import models
from rest_framework import serializers, status, viewsets
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import Contract, Milestone
from .serializers import ContractSerializer, MilestoneSerializer


class ContractPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            obj.client == request.user
            or obj.freelancer == request.user
        )

class ContractViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [ContractPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Contract.objects
            .select_related(
                "project",
                "client",
                "freelancer",
                "proposal",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(client=user)
            | models.Q(freelancer=user)
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        contract = self.get_object()

        if request.user != contract.client:
            return Response(
                {
                    "detail": "Only the client can complete the contract."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if contract.status != Contract.Status.ACTIVE:
            return Response(
                {
                    "detail": "Only active contracts can be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not hasattr(contract, "escrow"):
            return Response(
                {
                    "detail": "Contract has no escrow."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if contract.escrow.status != contract.escrow.Status.RELEASED:
            return Response(
                {
                    "detail": "Escrow must be released first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        contract.status = Contract.Status.COMPLETED

        contract.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        contract.project.status = (
            contract.project.Status.COMPLETED
        )

        contract.project.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(contract).data,
            status=status.HTTP_200_OK,
        )

class MilestonePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        contract = obj.contract

        if request.user.role == request.user.Role.ADMIN:
            return True

        return (
            contract.client == request.user
            or contract.freelancer == request.user
        )


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [MilestonePermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Milestone.objects
            .select_related(
                "contract",
                "contract__client",
                "contract__freelancer",
            )
            .order_by("deadline")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(contract__client=user)
            | models.Q(contract__freelancer=user)
        )

    def perform_create(self, serializer):
        contract_id = self.request.data.get("contract")

        contract = Contract.objects.filter(
            id=contract_id
        ).first()

        if not contract:
            raise serializers.ValidationError(
                {
                    "contract": "Contract not found."
                }
            )

        if (
            self.request.user.role != self.request.user.Role.ADMIN
            and contract.client != self.request.user
        ):
            raise PermissionDenied(
                "Only the client can create milestones."
            )

        serializer.save(
            contract=contract
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def start(self, request, pk=None):
        milestone = self.get_object()

        if request.user != milestone.contract.freelancer:
            return Response(
                {
                    "detail": "Only the freelancer can start a milestone."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if milestone.status != Milestone.Status.PENDING:
            return Response(
                {
                    "detail": "Only pending milestones can be started."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone.status = Milestone.Status.IN_PROGRESS

        milestone.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(milestone).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def submit(self, request, pk=None):
        milestone = self.get_object()

        if request.user != milestone.contract.freelancer:
            return Response(
                {
                    "detail": "Only the freelancer can submit a milestone."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if milestone.status != Milestone.Status.IN_PROGRESS:
            return Response(
                {
                    "detail": (
                        "Only milestones in progress "
                        "can be submitted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone.status = Milestone.Status.SUBMITTED

        milestone.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(milestone).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def approve(self, request, pk=None):
        milestone = self.get_object()

        if request.user != milestone.contract.client:
            return Response(
                {
                    "detail": "Only the client can approve a milestone."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if milestone.status != Milestone.Status.SUBMITTED:
            return Response(
                {
                    "detail": (
                        "Only submitted milestones "
                        "can be approved."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone.status = Milestone.Status.APPROVED

        milestone.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(milestone).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def reject(self, request, pk=None):
        milestone = self.get_object()

        if request.user != milestone.contract.client:
            return Response(
                {
                    "detail": "Only the client can reject a milestone."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if milestone.status != Milestone.Status.SUBMITTED:
            return Response(
                {
                    "detail": (
                        "Only submitted milestones "
                        "can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone.status = Milestone.Status.REJECTED

        milestone.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(milestone).data
        )