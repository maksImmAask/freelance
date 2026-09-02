import django_filters

from .models import Project


class ProjectFilter(django_filters.FilterSet):
    budget_min = django_filters.NumberFilter(
        field_name="budget_min",
        lookup_expr="gte",
    )

    budget_max = django_filters.NumberFilter(
        field_name="budget_max",
        lookup_expr="lte",
    )

    class Meta:
        model = Project
        fields = [
            "category",
            "experience_level",
            "status",
        ]