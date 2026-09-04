from decimal import Decimal

from django.db import models

from rest_framework import serializers

from .models import Milestone
from .models import Milestone
class ContractSerializer(serializers.ModelSerializer):
    client = serializers.ReadOnlyField(
        source="client.username"
    )

    freelancer = serializers.ReadOnlyField(
        source="freelancer.username"
    )

    class Meta:
        model = Contract
        fields = [
            "id",
            "project",
            "proposal",
            "client",
            "freelancer",
            "total_amount",
            "deadline",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "proposal",
            "client",
            "freelancer",
            "total_amount",
            "deadline",
            "status",
            "created_at",
            "updated_at",
        ]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone

        fields = [
            "id",
            "contract",
            "title",
            "description",
            "amount",
            "deadline",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "created_at",
            "updated_at",
        ]
        def validate(self, attrs):
            contract = attrs.get("contract")

            if not contract:
                return attrs

            amount = attrs.get(
                "amount",
                self.instance.amount if self.instance else Decimal("0.00"),
            )

            total = contract.milestones.exclude(
                pk=self.instance.pk if self.instance else None
            ).aggregate(
                total=models.Sum("amount")
            )["total"] or Decimal("0.00")

            if total + amount > contract.total_amount:
                raise serializers.ValidationError(
                    {
                        "amount": (
                            "Total milestone amount cannot exceed "
                            "contract total amount."
                        )
                    }
                )

            return attrs