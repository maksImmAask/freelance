from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(
        source="user.username"
    )

    class Meta:
        model = AuditLog

        fields = [
            "id",
            "user",
            "action",
            "model_name",
            "object_id",
            "description",
            "ip_address",
            "created_at",
        ]

        read_only_fields = fields