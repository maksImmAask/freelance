from rest_framework.routers import DefaultRouter

from .views import (
    ContractViewSet,
    MilestoneViewSet,
)


router = DefaultRouter()

router.register(
    "contracts",
    ContractViewSet,
    basename="contract",
)

router.register(
    "milestones",
    MilestoneViewSet,
    basename="milestone",
)


urlpatterns = router.urls