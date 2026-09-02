from rest_framework.routers import DefaultRouter

from .views import (
    WalletViewSet,
    TransactionViewSet,
    EscrowViewSet,
    CommissionViewSet,
)

router = DefaultRouter()

router.register(
    "wallets",
    WalletViewSet,
    basename="wallet",
)

router.register(
    "transactions",
    TransactionViewSet,
    basename="transaction",
)

router.register(
    "escrows",
    EscrowViewSet,
    basename="escrow",
)

router.register(
    "commissions",
    CommissionViewSet,
    basename="commission",
)

urlpatterns = router.urls