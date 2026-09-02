from .views import (
    RegisterView,
    LoginView,
    RefreshView,
    MeView,
    FreelancerProfileView,
    ClientProfileView,
)
from django.urls import path
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),

    path(
        "freelancer/me/",
        FreelancerProfileView.as_view(),
        name="freelancer-profile",
    ),

    path(
        "client/me/",
        ClientProfileView.as_view(),
        name="client-profile",
    ),
]