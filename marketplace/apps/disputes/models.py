from django.conf import settings
from django.db import models


class Dispute(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_REVIEW = "IN_REVIEW", "In Review"
        RESOLVED_CLIENT = "RESOLVED_CLIENT", "Resolved for Client"
        RESOLVED_FREELANCER = "RESOLVED_FREELANCER", "Resolved for Freelancer"
        REJECTED = "REJECTED", "Rejected"

    contract = models.ForeignKey(
        "contracts.Contract",
        on_delete=models.CASCADE,
        related_name="disputes",
    )

    opened_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="disputes_opened",
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.OPEN,
    )

    resolution = models.TextField(
        blank=True,
    )

    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="disputes_resolved",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Dispute #{self.id} - Contract #{self.contract.id}"