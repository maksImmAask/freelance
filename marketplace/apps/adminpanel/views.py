from django.contrib.auth import get_user_model
from django.db.models import Count

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet


User = get_user_model()


class AdminOnlyMixin:

    def dispatch(self, request, *args, **kwargs):
        if (
            not request.user.is_authenticated
            or request.user.role != request.user.Role.ADMIN
        ):
            return Response(
                {"detail": "Admin access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().dispatch(request, *args, **kwargs)


class AdminDashboardView(AdminOnlyMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.projects.models import Project
        from apps.proposals.models import Proposal
        from apps.contracts.models import Contract
        from apps.disputes.models import Dispute
        from apps.reviews.models import Review

        return Response(
            {
                "users": User.objects.count(),
                "clients": User.objects.filter(
                    role=User.Role.CLIENT
                ).count(),
                "freelancers": User.objects.filter(
                    role=User.Role.FREELANCER
                ).count(),
                "projects": Project.objects.count(),
                "published_projects": Project.objects.filter(
                    status=Project.Status.PUBLISHED
                ).count(),
                "proposals": Proposal.objects.count(),
                "contracts": Contract.objects.count(),
                "active_contracts": Contract.objects.filter(
                    status=Contract.Status.ACTIVE
                ).count(),
                "reviews": Review.objects.count(),
                "open_disputes": Dispute.objects.filter(
                    status=Dispute.Status.OPEN
                ).count(),
            }
        )


class AdminUserViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    serializer_class = __import__(
        "apps.adminpanel.serializers",
        fromlist=["AdminUserSerializer"],
    ).AdminUserSerializer

    queryset = User.objects.all().order_by("-date_joined")

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        user = self.get_object()

        if user == request.user:
            return Response(
                {"detail": "You cannot block yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save(update_fields=["is_active"])

        return Response(
            {
                "detail": "User blocked.",
                "user_id": user.id,
            }
        )

    @action(detail=True, methods=["post"])
    def unblock(self, request, pk=None):
        user = self.get_object()

        user.is_active = True
        user.save(update_fields=["is_active"])

        return Response(
            {
                "detail": "User unblocked.",
                "user_id": user.id,
            }
        )

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)

        if request.user.role != request.user.Role.ADMIN:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Admin access required."
            )