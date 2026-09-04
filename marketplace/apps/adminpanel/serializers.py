from django.contrib.auth import get_user_model

from rest_framework import serializers


User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_verified",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "role",
            "date_joined",
        ]