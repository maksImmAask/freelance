from rest_framework import serializers

from .models import Dispute


class DisputeSerializer(serializers.ModelSerializer):
    opened_by = serializers.ReadOnlyField(
        source="opened_by.username"
    )

    resolved_by = serializers.ReadOnlyField(
        source="resolved_by.username"
    )

    class Meta:
        model = Dispute

        fields = [
            "id",
            "contract",
            "opened_by",
            "reason",
            "status",
            "resolution",
            "resolved_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "opened_by",
            "status",
            "resolution",
            "resolved_by",
            "created_at",
            "updated_at",
        ]