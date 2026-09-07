import pytest

from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from apps.projects.models import Category, Project


User = get_user_model()


@pytest.mark.django_db
def test_freelancer_can_create_proposal():

    client_user = User.objects.create_user(
        username="client",
        email="client@example.com",
        password="StrongPassword123",
        role=User.Role.CLIENT,
    )

    freelancer = User.objects.create_user(
        username="freelancer",
        email="freelancer@example.com",
        password="StrongPassword123",
        role=User.Role.FREELANCER,
    )

    category = Category.objects.create(
        name="Development",
        slug="development",
    )

    project = Project.objects.create(
        client=client_user,
        title="Django",
        description="Build API",
        category=category,
        budget_min="100",
        budget_max="500",
        deadline="2030-01-01T12:00:00Z",
        experience_level="INTERMEDIATE",
        status=Project.Status.PUBLISHED,
    )

    api = APIClient()
    api.force_authenticate(user=freelancer)

    response = api.post(
        "/api/v1/proposals/",
        {
            "project": project.id,
            "cover_letter": "I can build this.",
            "price": "300",
            "delivery_days": 10,
        },
        format="json",
    )
    print(response.data)
    assert response.status_code == 201