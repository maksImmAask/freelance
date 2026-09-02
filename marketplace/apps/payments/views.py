from django.db import models
from django.db import transaction as db_transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Wallet,
    Transaction,
    Escrow,
    Commission,
)

from .serializers import (
    WalletSerializer,
    TransactionSerializer,
    EscrowSerializer,
    CommissionSerializer,
)


class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == user.Role.ADMIN:
            return Wallet.objects.select_related("user").all()

        return Wallet.objects.select_related("user").filter(
            user=user
        )


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Transaction.objects
            .select_related(
                "wallet",
                "wallet__user",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(wallet__user=user)


class EscrowViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EscrowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Escrow.objects
            .select_related(
                "contract",
                "contract__project",
                "client",
                "contract__freelancer",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(client=user)
            | models.Q(contract__freelancer=user)
        )

    @action(detail=True, methods=["post"])
    @db_transaction.atomic
    def fund(self, request, pk=None):
        escrow = self.get_object()

        if request.user != escrow.client:
            return Response(
                {
                    "detail": "Only the client can fund escrow."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if escrow.status != Escrow.Status.PENDING:
            return Response(
                {
                    "detail": "Escrow must be pending."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet = Wallet.objects.select_for_update().get(
            user=request.user
        )

        if wallet.balance < escrow.amount:
            return Response(
                {
                    "detail": "Insufficient wallet balance."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet.balance -= escrow.amount

        wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.PAYMENT,
            amount=escrow.amount,
            status=Transaction.Status.COMPLETED,
            description=f"Escrow funding #{escrow.id}",
        )

        escrow.status = Escrow.Status.FUNDED

        escrow.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(escrow).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @db_transaction.atomic
    def release(self, request, pk=None):
        escrow = self.get_object()

        if request.user != escrow.client:
            return Response(
                {
                    "detail": "Only the client can release escrow."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if escrow.status != Escrow.Status.FUNDED:
            return Response(
                {
                    "detail": "Escrow must be funded first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        freelancer = escrow.contract.freelancer

        freelancer_wallet = (
            Wallet.objects
            .select_for_update()
            .get(user=freelancer)
        )

        commission = Commission.objects.get(
            contract=escrow.contract
        )

        freelancer_amount = (
            escrow.amount - commission.amount
        )

        freelancer_wallet.balance += freelancer_amount

        freelancer_wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        Transaction.objects.create(
            wallet=freelancer_wallet,
            transaction_type=Transaction.Type.PAYMENT,
            amount=freelancer_amount,
            status=Transaction.Status.COMPLETED,
            description=f"Contract #{escrow.contract.id} payment",
        )

        escrow.status = Escrow.Status.RELEASED

        escrow.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(escrow).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    @db_transaction.atomic
    def refund(self, request, pk=None):
        escrow = self.get_object()

        if request.user.role != request.user.Role.ADMIN:
            return Response(
                {
                    "detail": "Only admin can refund escrow."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if escrow.status != Escrow.Status.FUNDED:
            return Response(
                {
                    "detail": "Only funded escrow can be refunded."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        wallet = Wallet.objects.select_for_update().get(
            user=escrow.client
        )

        wallet.balance += escrow.amount

        wallet.save(
            update_fields=[
                "balance",
                "updated_at",
            ]
        )

        Transaction.objects.create(
            wallet=wallet,
            transaction_type=Transaction.Type.REFUND,
            amount=escrow.amount,
            status=Transaction.Status.COMPLETED,
            description=f"Escrow refund #{escrow.id}",
        )

        escrow.status = Escrow.Status.REFUNDED

        escrow.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(escrow).data,
            status=status.HTTP_200_OK,
        )


class CommissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CommissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Commission.objects
            .select_related(
                "contract",
                "contract__project",
                "contract__client",
                "contract__freelancer",
            )
            .order_by("-created_at")
        )

        if user.role == user.Role.ADMIN:
            return queryset

        return queryset.filter(
            models.Q(contract__client=user)
            | models.Q(contract__freelancer=user)
        )