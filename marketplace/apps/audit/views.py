from rest_framework import viewsets
from rest_framework.permissions import BasePermission

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditAdminPermission(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.ADMIN
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        AuditLog.objects
        .select_related("user")
        .order_by("-created_at")
    )

    serializer_class = AuditLogSerializer
    permission_classes = [AuditAdminPermission]