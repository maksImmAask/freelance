from rest_framework import serializers

from .models import Proposal


class ProposalSerializer(serializers.ModelSerializer):
    freelancer = serializers.ReadOnlyField(
        source="freelancer.username"
    )

    class Meta:
        model = Proposal
        fields = [
            "id",
            "project",
            "freelancer",
            "cover_letter",
            "price",
            "delivery_days",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "freelancer",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_project(self, project):
        if project.status != project.Status.PUBLISHED:
            raise serializers.ValidationError(
                "You can only submit a proposal to a published project."
            )

        return project