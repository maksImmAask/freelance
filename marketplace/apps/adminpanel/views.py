from django.contrib.auth import get_user_model

from rest_framework import status, viewsets
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.contracts.models import Contract
from apps.disputes.models import Dispute
from apps.projects.models import Project
from apps.proposals.models import Proposal
from apps.reviews.models import Review

from .serializers import AdminUserSerializer


User = get_user_model()


class IsAdminRole(BasePermission):
    """
    Разрешает доступ только пользователям
    с ролью ADMIN.
    """

    message = "Admin access required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        users = User.objects.count()

        clients = User.objects.filter(
            role=User.Role.CLIENT
        ).count()

        freelancers = User.objects.filter(
            role=User.Role.FREELANCER
        ).count()

        projects = Project.objects.count()

        published_projects = Project.objects.filter(
            status=Project.Status.PUBLISHED
        ).count()

        proposals = Proposal.objects.count()

        contracts = Contract.objects.count()

        active_contracts = Contract.objects.filter(
            status=Contract.Status.ACTIVE
        ).count()

        reviews = Review.objects.count()

        open_disputes = Dispute.objects.filter(
            status=Dispute.Status.OPEN
        ).count()

        return Response(
            {
                "users": users,
                "clients": clients,
                "freelancers": freelancers,
                "projects": projects,
                "published_projects": published_projects,
                "proposals": proposals,
                "contracts": contracts,
                "active_contracts": active_contracts,
                "reviews": reviews,
                "open_disputes": open_disputes,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()

        return Response(
            self.get_serializer(user).data,
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def _get_user(pk):
        return User.objects.get(pk=pk)

    from rest_framework.decorators import action

    @action(
        detail=True,
        methods=["post"],
        url_path="block",
    )
    def block(self, request, pk=None):
        user = self.get_object()

        if user.id == request.user.id:
            return Response(
                {
                    "detail": "You cannot block yourself."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.save(
            update_fields=["is_active"]
        )

        return Response(
            self.get_serializer(user).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="unblock",
    )
    def unblock(self, request, pk=None):
        user = self.get_object()

        user.is_active = True
        user.save(
            update_fields=["is_active"]
        )

        return Response(
            self.get_serializer(user).data,
            status=status.HTTP_200_OK,
        )