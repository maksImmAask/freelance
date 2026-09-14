from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminDashboardView,
    AdminUserViewSet,
)

router = DefaultRouter()

router.register(
    "users",
    AdminUserViewSet,
    basename="admin-users",
)

urlpatterns = [
    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),
    path(
        "",
        include(router.urls),
    ),
]