from django.contrib import admin

from .models import Category, Skill


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "slug",
        "created_at",
    ]

    search_fields = [
        "name",
    ]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "slug",
        "created_at",
    ]

    search_fields = [
        "name",
    ]
from .models import Category, Skill, Project
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "title",
        "client",
        "category",
        "budget_min",
        "budget_max",
        "experience_level",
        "status",
        "created_at",
    ]

    list_filter = [
        "status",
        "experience_level",
        "category",
    ]

    search_fields = [
        "title",
        "description",
        "client__username",
    ]

    filter_horizontal = [
        "skills",
    ]