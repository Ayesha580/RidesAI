from hr.models import Task, Attendance, Leave


def get_my_tasks(user):
    """
    Return tasks assigned to the current user.
    READ-ONLY.
    """

    return Task.objects.filter(
        company=user.company,
        assigned_to=user,
    ).values(
        "id",
        "title",
        "description",
        "priority",
        "status",
        "completion",
        "due_date",
    )


def get_my_attendance(user):
    """
    Return attendance records for the current user.
    READ-ONLY.
    """

    employee = getattr(
        user,
        "employee_profile",
        None,
    )

    if not employee:
        return []

    return Attendance.objects.filter(
        company=user.company,
        employee=employee,
    ).values(
        "date",
        "clock_in",
        "clock_out",
        "is_late",
        "overtime_hours",
    )


def get_my_leave(user):
    """
    Return leave records for the current user.
    READ-ONLY.
    """

    employee = getattr(
        user,
        "employee_profile",
        None,
    )

    if not employee:
        return []

    return Leave.objects.filter(
        company=user.company,
        employee=employee,
    ).values(
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
        "reason",
    )