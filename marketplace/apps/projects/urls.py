from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    SkillViewSet,
    ProjectViewSet,
)


router = DefaultRouter()

router.register(
    "categories",
    CategoryViewSet,
    basename="category",
)

router.register(
    "skills",
    SkillViewSet,
    basename="skill",
)

router.register(
    "projects",
    ProjectViewSet,
    basename="project",
)


urlpatterns = router.urls