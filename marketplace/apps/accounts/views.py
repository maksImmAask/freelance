from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.exceptions import PermissionDenied

from .models import FreelancerProfile, ClientProfile
from .serializers import (
    RegisterSerializer,
    MeSerializer,
    FreelancerProfileSerializer,
    ClientProfileSerializer,
)
from django.db.models import Avg
from .serializers import RegisterSerializer, MeSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
class FreelancerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = FreelancerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if user.role != user.Role.FREELANCER:
            raise PermissionDenied(
                "Only freelancers can access this profile."
            )

        profile, created = FreelancerProfile.objects.get_or_create(
            user=user
        )

        return profile
    

class ClientProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if user.role != user.Role.CLIENT:
            raise PermissionDenied(
                "Only clients can access this profile."
            )

        profile, created = ClientProfile.objects.get_or_create(
            user=user
        )

        return profile