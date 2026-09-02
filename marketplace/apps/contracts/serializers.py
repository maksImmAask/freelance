from rest_framework import serializers

from .models import Contract, Milestone


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