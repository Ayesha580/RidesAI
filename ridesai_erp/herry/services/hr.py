from hr.models import Employee, Attendance, Leave


def get_employees(user):
    return Employee.objects.filter(
        company=user.company,
        status="Active",
    ).values(
        "id",
        "user__first_name",
        "user__last_name",
        "designation",
        "department",
        "employment_type",
        "status",
    )


def get_employee_attendance(user):
    return Attendance.objects.filter(
        company=user.company,
    ).values(
        "id",
        "employee__user__first_name",
        "employee__user__last_name",
        "date",
        "clock_in",
        "clock_out",
        "is_late",
        "overtime_hours",
    )


def get_leave_summary(user):
    return Leave.objects.filter(
        company=user.company,
    ).values(
        "id",
        "employee__user__first_name",
        "employee__user__last_name",
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
        "reason",
    )


def get_hiring_data(user):
    employees = Employee.objects.filter(
        company=user.company,
    )

    return {
        "total_employees": employees.count(),
        "active_employees": employees.filter(
            status="Active"
        ).count(),
        "inactive_employees": employees.exclude(
            status="Active"
        ).count(),
    }