from django.db import models, transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from apps.payments.models import Escrow, Commission
from apps.contracts.models import Contract
from apps.payments.models import Escrow
from .models import Proposal
from .serializers import ProposalSerializer


class ProposalPermission(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method == "POST":
            return request.user.role == request.user.Role.FREELANCER

        return request.user.role in [
            request.user.Role.CLIENT,
            request.user.Role.FREELANCER,
            request.user.Role.ADMIN,
        ]

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        if request.user.role == request.user.Role.FREELANCER:
            return obj.freelancer == request.user

        if request.user.role == request.user.Role.CLIENT:
            return obj.project.client == request.user

        return False


class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [ProposalPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Proposal.objects
            .select_related(
                "project",
                "project__client",
                "freelancer",
            )
            .order_by("-created_at")
        )

        if not user.is_authenticated:
            return queryset.none()

        if user.role == user.Role.ADMIN:
            return queryset

        if user.role == user.Role.FREELANCER:
            return queryset.filter(
                freelancer=user
            )
        if user.role == user.Role.CLIENT:
            return queryset.filter(
                project__client=user
            )

        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(
            freelancer=self.request.user
        )

    def update(self, request, *args, **kwargs):
        proposal = self.get_object()
        if proposal.status != Proposal.Status.PENDING:
            return Response(
                {
                    "detail": "Only pending proposals can be edited."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().update(
            request,
            *args,
            **kwargs
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[ProposalPermission],
    )
    @transaction.atomic
    def accept(self, request, pk=None):
        proposal = self.get_object()

        if request.user != proposal.project.client:
            return Response(
                {
                    "detail": (
                        "Only the project owner "
                        "can accept a proposal."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if proposal.status != Proposal.Status.PENDING:
            return Response(
                {
                    "detail": (
                        "Only pending proposals "
                        "can be accepted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        proposal.status = Proposal.Status.ACCEPTED
        proposal.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        contract = Contract.objects.create(
            project=proposal.project,
            client=proposal.project.client,
            freelancer=proposal.freelancer,
            proposal=proposal,
            total_amount=proposal.price,
            deadline=proposal.project.deadline,
            status=Contract.Status.ACTIVE,
        )
        escrow = Escrow.objects.create(
            contract=contract,
            client=contract.client,
            amount=contract.total_amount,
            status=Escrow.Status.PENDING,
        )
        commission_percentage = Decimal("10.00")

        commission_amount = (
            contract.total_amount
            * commission_percentage
            / Decimal("100")
        )

        Commission.objects.create(
            contract=contract,
            percentage=commission_percentage,
            amount=commission_amount,
        )

        proposal.project.status = (
            proposal.project.Status.IN_PROGRESS
        )

        proposal.project.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "proposal": self.get_serializer(
                    proposal
                ).data,

                "contract": {
                    "id": contract.id,
                    "project": contract.project.id,
                    "client": contract.client.username,
                    "freelancer": contract.freelancer.username,
                    "total_amount": str(
                        contract.total_amount
                    ),
                    "deadline": contract.deadline,
                    "status": contract.status,
                },
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[ProposalPermission],
    )
    def reject(self, request, pk=None):
        proposal = self.get_object()

        if request.user != proposal.project.client:
            return Response(
                {
                    "detail": (
                        "Only the project owner "
                        "can reject a proposal."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if proposal.status != Proposal.Status.PENDING:
            return Response(
                {
                    "detail": (
                        "Only pending proposals "
                        "can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        proposal.status = Proposal.Status.REJECTED

        proposal.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(proposal).data,
            status=status.HTTP_200_OK,
        )