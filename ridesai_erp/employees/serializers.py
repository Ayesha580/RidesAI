from rest_framework import serializers
from hr.models import Employee


class EmployeeProfileSerializer(serializers.ModelSerializer):

    name = serializers.CharField(
        source="user.get_full_name",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "name",
            "email",
            "photo",
            "designation",
            "department",
            "employee_id",
            "joining_date",
        ]