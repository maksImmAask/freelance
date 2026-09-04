from django.contrib.auth import get_user_model
from rest_framework import serializers # type: ignore
from django.db.models import Avg
from .models import ClientProfile, FreelancerProfile
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )

        return user
class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "avatar",
            "is_verified",
        ]
        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
            "avatar",
            "is_verified",
        ]
class FreelancerProfileSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()

    class Meta:
        model = FreelancerProfile
        fields = [
            "id",
            "bio",
            "specialization",
            "hourly_rate",
            "experience_years",
            "rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "rating",
            "created_at",
            "updated_at",
        ]

    def get_rating(self, obj):
        result = obj.user.reviews_received.aggregate(
            average=Avg("rating")
        )

        return round(
            result["average"] or 0,
            2,
        )

class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = [
            "id",
            "company_name",
            "bio",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]