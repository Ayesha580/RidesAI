from hr.models import Employee, Task


def get_hiring_data(user):

    company = user.company

    active_employees = Employee.objects.filter(
        company=company,
        status="Active"
    )

    result = []

    for employee in active_employees:

        total_tasks = Task.objects.filter(
            company=company,
            assigned_to=employee.user
        ).count()

        pending_tasks = Task.objects.filter(
            company=company,
            assigned_to=employee.user
        ).exclude(
            status=Task.STATUS_DONE
        ).count()

        result.append({
            "employee": employee.user.get_full_name(),
            "department": employee.department,
            "designation": employee.designation,
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "salary": float(employee.salary),
        })

    return result