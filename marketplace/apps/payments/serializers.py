from rest_framework import serializers

from .models import Wallet, Transaction, Escrow
from .models import (
    Wallet,
    Transaction,
    Escrow,
    Commission,
)

class WalletSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Wallet
        fields = [
            "id",
            "user",
            "balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "balance",
            "created_at",
            "updated_at",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    wallet = serializers.ReadOnlyField(source="wallet.id")

    class Meta:
        model = Transaction
        fields = [
            "id",
            "wallet",
            "transaction_type",
            "amount",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "wallet",
            "transaction_type",
            "amount",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]


class EscrowSerializer(serializers.ModelSerializer):
    client = serializers.ReadOnlyField(source="client.username")
    project = serializers.ReadOnlyField(source="contract.project.title")

    class Meta:
        model = Escrow
        fields = [
            "id",
            "contract",
            "project",
            "client",
            "amount",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "contract",
            "project",
            "client",
            "amount",
            "status",
            "created_at",
            "updated_at",
        ]
class CommissionSerializer(serializers.ModelSerializer):
    contract_title = serializers.ReadOnlyField(
        source="contract.project.title"
    )

    class Meta:
        model = Commission
        fields = [
            "id",
            "contract",
            "contract_title",
            "percentage",
            "amount",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "contract",
            "contract_title",
            "percentage",
            "amount",
            "created_at",
        ]