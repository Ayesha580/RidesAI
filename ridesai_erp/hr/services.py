from django.utils import timezone

from .models import Attendance


def get_today_attendance(employee):

    attendance, created = Attendance.objects.get_or_create(

        employee=employee,

        company=employee.company,

        date=timezone.localdate()

    )

    return attendance