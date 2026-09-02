from rest_framework import serializers

from .models import Category, Skill


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
        ]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "slug",
        ]
from .models import Category, Skill, Project
class ProjectSerializer(serializers.ModelSerializer):
    client = serializers.ReadOnlyField(source="client.username")

    class Meta:
        model = Project
        fields = [
            "id",
            "client",
            "title",
            "description",
            "category",
            "skills",
            "budget_min",
            "budget_max",
            "deadline",
            "experience_level",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "client",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        budget_min = attrs.get("budget_min")
        budget_max = attrs.get("budget_max")

        if budget_min is not None and budget_max is not None:
            if budget_min > budget_max:
                raise serializers.ValidationError({
                    "budget": "Minimum budget cannot be greater than maximum budget."
                })

        return attrs
from rest_framework.permissions import BasePermission


class IsClientOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.CLIENT
        )

    def has_object_permission(self, request, view, obj):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return obj.client == request.user
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Category, Skill, Project
from .serializers import (
    CategorySerializer,
    SkillSerializer,
    ProjectSerializer,
)
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsClientOrReadOnly]

    def get_queryset(self):
        return Project.objects.select_related(
            "client",
            "category",
        ).prefetch_related(
            "skills",
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            client=self.request.user,
        )