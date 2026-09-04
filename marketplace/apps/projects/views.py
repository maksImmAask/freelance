from rest_framework import viewsets
from rest_framework.permissions import AllowAny, BasePermission
from django.db import models
from .models import Category, Skill, Project
from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    CategorySerializer,
    SkillSerializer,
    ProjectSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all().order_by("name")
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]


class IsClientOrReadOnly(BasePermission):

    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if not request.user.is_authenticated:
            return False

        return request.user.role in [
            request.user.Role.CLIENT,
            request.user.Role.ADMIN,
        ]

    def has_object_permission(self, request, view, obj):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if request.user.role == request.user.Role.ADMIN:
            return True

        return obj.client == request.user
from .filters import ProjectFilter
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsClientOrReadOnly]
    filterset_class = ProjectFilter

    search_fields = [
        "title",
        "description",
        "skills__name",
    ]
    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]

    ordering_fields = [
        "created_at",
        "budget_min",
        "budget_max",
        "deadline",
    ]

    ordering = [
        "-created_at",
    ]
    @action(
    detail=True,
    methods=["post"],
    permission_classes=[IsAuthenticated],
    )
    def publish(self, request, pk=None):
        project = self.get_object()

        if request.user.role != request.user.Role.CLIENT:
            return Response(
                {
                    "detail": "Only clients can publish projects."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if project.client != request.user:
            return Response(
                {
                    "detail": "You can only publish your own projects."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if project.status != Project.Status.DRAFT:
            return Response(
                {
                    "detail": "Only draft projects can be published."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        project.status = Project.Status.PUBLISHED
        project.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(project).data,
            status=status.HTTP_200_OK,
        )

    def get_queryset(self):
        queryset = (
            Project.objects
            .select_related(
                "client",
                "category",
            )
            .prefetch_related(
                "skills",
            )
        )

        user = self.request.user
        if not user.is_authenticated:
            return queryset.filter(
                status=Project.Status.PUBLISHED
            ).order_by("-created_at")

        if user.role == user.Role.ADMIN:
            return queryset.order_by("-created_at")

        if user.role == user.Role.CLIENT:
            return queryset.filter(
                models.Q(
                    status=Project.Status.PUBLISHED
                )
                | models.Q(
                    client=user
                )
            ).order_by("-created_at")

        return queryset.filter(
            status=Project.Status.PUBLISHED
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            client=self.request.user,
        )
