from django.urls import path

from rest_framework.routers import DefaultRouter

from .views import AdminDashboardView, AdminUserViewSet


router = DefaultRouter()

router.register(
    "users",
    AdminUserViewSet,
    basename="admin-user",
)


urlpatterns = [
    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),
]

urlpatterns += router.urls