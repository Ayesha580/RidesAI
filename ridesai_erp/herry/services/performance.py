from hr.models import Employee, Task, Attendance


def get_employee_performance(user):

    employees = Employee.objects.filter(
        company=user.company,
        status="Active"
    )

    results = []

    for employee in employees:

        total_tasks = Task.objects.filter(
            company=user.company,
            assigned_to=employee.user
        ).count()

        completed_tasks = Task.objects.filter(
            company=user.company,
            assigned_to=employee.user,
            status=Task.STATUS_DONE
        ).count()

        attendance_count = Attendance.objects.filter(
            company=user.company,
            employee=employee
        ).count()

        late_count = Attendance.objects.filter(
            company=user.company,
            employee=employee,
            is_late=True
        ).count()

        task_score = (
            (completed_tasks / total_tasks) * 100
            if total_tasks else 0
        )

        attendance_score = (
            ((attendance_count - late_count) / attendance_count) * 100
            if attendance_count else 0
        )

        performance_score = (
            task_score * 0.7
            + attendance_score * 0.3
        )

        results.append({
            "employee_id": employee.id,
            "employee": employee.user.get_full_name(),
            "task_score": round(task_score, 2),
            "attendance_score": round(attendance_score, 2),
            "performance_score": round(performance_score, 2),
        })

    return results