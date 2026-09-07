import pytest

from rest_framework.test import APIClient


@pytest.mark.django_db
def test_register():
    client = APIClient()

    response = client.post(
        "/api/v1/auth/register/",
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123",
            "role": "FREELANCER",
        },
        format="json",
    )

    assert response.status_code in [200, 201]