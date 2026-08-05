import re

from rest_framework import serializers
from .models import User
from rest_framework import serializers
from .models import User
from companies.models import Company


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    business_type = serializers.CharField(
        write_only=True
    )

    business_name = serializers.CharField(
        write_only=True
    )

    business_address = serializers.CharField(
        write_only=True
    )

    is_registered = serializers.BooleanField(
        write_only=True
    )

    registration_docs = serializers.FileField(
        required=False,
        allow_null=True,
        write_only=True
    )


    class Meta:

        model = User

        fields = [

            # User info
            "first_name",
            "username",
            "email",
            "phone",
            "password",

            # ID card
            "cnic",

            # Business
            "business_type",
            "business_name",
            "business_address",
            "is_registered",
            "registration_docs",

        ]

    def create(self, validated_data):
        """
        Note: Register step mein yeh call NAHI hoga.
        Yeh sirf CompleteRegistrationAPIView (payment ke baad) use karega.
        """
        company = Company.objects.create(
            name=validated_data.get("business_name", ""),
            business_type=validated_data.get("business_type", ""),
            address=validated_data.get("business_address", ""),
            is_registered=validated_data.get("is_registered", False),
            registration_docs=validated_data.get("registration_docs"),
            cnic=validated_data.get("cnic", ""),
            email=validated_data.get("email", ""),
            phone=validated_data.get("phone", ""),
            status=Company.STATUS_ACTIVE,
        )

        user = User(
            company=company,
            role=User.ROLE_OWNER,
            first_name=validated_data.get("first_name", ""),
            username=validated_data.get("username", ""),
            email=validated_data.get("email", ""),
            phone=validated_data.get("phone", ""),
            cnic=validated_data.get("cnic", ""),
        )
        user.set_password(validated_data["password"])
        user.save()

        return user



    def validate(self, data):

        # Registered business hai to docs required
        if data.get("is_registered"):

            if not data.get("registration_docs"):

                raise serializers.ValidationError({

                    "registration_docs":
                    "Business registration documents required."

                })


        return data

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"03\d{9}", value):
            raise serializers.ValidationError(
                "Phone number must be in format 03XXXXXXXXX."
            )
        return value

    def validate_cnic(self, value):
        value = value.strip()
        if not re.fullmatch(r"\d{5}-\d{7}-\d", value):
            raise serializers.ValidationError(
                "CNIC must be in format 12345-1234567-1."
            )
        return value


    def validate_email(self,value):

        if User.objects.filter(email=value).exists():

            raise serializers.ValidationError(
                "Email already registered."
            )
        return value


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "full_name", "role")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class UserSerializer(serializers.ModelSerializer):

    plan = serializers.CharField(
        source="company.plan.name",
        read_only=True
    )

    company_name = serializers.CharField(
        source="company.name",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "role",
            "company_name",
            "plan",
        ]