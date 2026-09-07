import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.projects.models import Category, Project, Skill

User = get_user_model()


@pytest.mark.django_db
def test_client_can_create_project():
    client_user = User.objects.create_user(
        username="client",
        email="client@example.com",
        password="StrongPassword123",
        role=User.Role.CLIENT,
    )

    category = Category.objects.create(
        name="Development",
        slug="development",
    )

    skill = Skill.objects.create(
        name="Django",
        slug="django",
    )

    api = APIClient()
    api.force_authenticate(user=client_user)

    response = api.post(
        "/api/v1/projects/",
        {
            "title": "Django project",
            "description": "Build API",
            "category": category.id,
            "skills": [skill.id],
            "budget_min": "100.00",
            "budget_max": "500.00",
            "deadline": "2030-01-01T12:00:00Z",
            "experience_level": "INTERMEDIATE",
        },
        format="json",
    )

    print(response.data)

    assert response.status_code == 201