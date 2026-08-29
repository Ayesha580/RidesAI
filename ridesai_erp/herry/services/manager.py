from hr.models import Employee, Task


def get_my_team(user):
    """
    Return active employees managed by the current manager.
    READ-ONLY.
    """

    return Employee.objects.filter(
        company=user.company,
        manager=user,
        status="Active",
    ).values(
        "id",
        "user__first_name",
        "user__last_name",
        "designation",
        "department",
        "employment_type",
    )


def get_team_tasks(user):
    """
    Return tasks assigned to employees managed by the current manager.
    READ-ONLY.
    """

    team_employee_ids = Employee.objects.filter(
        company=user.company,
        manager=user,
    ).values_list(
        "user_id",
        flat=True,
    )

    return Task.objects.filter(
        company=user.company,
        assigned_to_id__in=team_employee_ids,
    ).values(
        "id",
        "title",
        "assigned_to__first_name",
        "assigned_to__last_name",
        "priority",
        "status",
        "completion",
        "due_date",
    )