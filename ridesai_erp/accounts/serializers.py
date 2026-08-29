import re

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

    registration_number = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True
    )

    # ==========================================
    # DOCUMENTS
    # ==========================================

    business_registration_document = serializers.FileField(
        required=False,
        allow_null=True,
        write_only=True
    )

    cnic_front = serializers.FileField(
        required=True,
        write_only=True
    )

    cnic_back = serializers.FileField(
        required=True,
        write_only=True
    )

    passport_size_photo = serializers.ImageField(
        required=True,
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

            # ID card number
            "cnic",

            # Business
            "business_type",
            "business_name",
            "business_address",
            "is_registered",
            "registration_number",

            # Documents
            "business_registration_document",
            "cnic_front",
            "cnic_back",
            "passport_size_photo",
        ]

    def create(self, validated_data):
        """
        Registration step par yeh create() use nahi ho raha.
        Actual user/company CompleteRegistrationAPIView mein
        payment ke baad create ho raha hai.
        """

        company = Company.objects.create(
            name=validated_data.get("business_name", ""),
            business_type=validated_data.get("business_type", ""),
            address=validated_data.get("business_address", ""),
            is_registered=validated_data.get(
                "is_registered",
                False
            ),

            registration_number=validated_data.get(
                "registration_number",
                ""
            ),

            business_registration_document=validated_data.get(
                "business_registration_document"
            ),

            cnic_front=validated_data.get(
                "cnic_front"
            ),

            cnic_back=validated_data.get(
                "cnic_back"
            ),

            passport_size_photo=validated_data.get(
                "passport_size_photo"
            ),

            cnic=validated_data.get("cnic", ""),
            email=validated_data.get("email", ""),
            phone=validated_data.get("phone", ""),
            status=Company.STATUS_ACTIVE,
        )

        user = User(
            company=company,
            role=User.ROLE_OWNER,
            first_name=validated_data.get(
                "first_name",
                ""
            ),
            username=validated_data.get(
                "username",
                ""
            ),
            email=validated_data.get(
                "email",
                ""
            ),
            phone=validated_data.get(
                "phone",
                ""
            ),
            cnic=validated_data.get(
                "cnic",
                ""
            ),
        )

        user.set_password(
            validated_data["password"]
        )

        user.save()

        return user

    def validate(self, data):

        # ==========================================
        # REGISTERED BUSINESS
        # ==========================================

        if data.get("is_registered"):

            if not data.get(
                "business_registration_document"
            ):

                raise serializers.ValidationError({
                    "business_registration_document":
                    "Business registration document is required."
                })

            if not data.get(
                "registration_number"
            ):

                raise serializers.ValidationError({
                    "registration_number":
                    "Registration number is required."
                })

        # ==========================================
        # OWNER DOCUMENTS
        # ==========================================

        if not data.get("cnic_front"):

            raise serializers.ValidationError({
                "cnic_front":
                "CNIC / ID Card front is required."
            })

        if not data.get("cnic_back"):

            raise serializers.ValidationError({
                "cnic_back":
                "CNIC / ID Card back is required."
            })

        if not data.get("passport_size_photo"):

            raise serializers.ValidationError({
                "passport_size_photo":
                "Passport-size photo is required."
            })

        return data

    def validate_phone(self, value):

        value = value.strip()

        if not re.fullmatch(
            r"03\d{9}",
            value
        ):

            raise serializers.ValidationError(
                "Phone number must be in format 03XXXXXXXXX."
            )

        return value

    def validate_cnic(self, value):

        value = value.strip()

        if not re.fullmatch(
            r"\d{5}-\d{7}-\d",
            value
        ):

            raise serializers.ValidationError(
                "CNIC must be in format 12345-1234567-1."
            )

        return value

    def validate_email(self, value):

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email already registered."
            )

        return value


class UserListSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:

        model = User

        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "role"
        )

    def get_full_name(self, obj):

        return (
            obj.get_full_name()
            or obj.username
        )


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
