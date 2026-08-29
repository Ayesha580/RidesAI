from django.db.models import Count

from hr.models import Employee, Task, Attendance
from crm.models import Lead


def get_business_overview(user):

    company = user.company

    employees = Employee.objects.filter(
        company=company,
        status="Active"
    ).count()

    total_tasks = Task.objects.filter(
        company=company
    ).count()

    pending_tasks = Task.objects.filter(
        company=company
    ).exclude(
        status=Task.STATUS_DONE
    ).count()

    overdue_tasks = Task.objects.filter(
        company=company,
        due_date__lt=__import__("django").utils.timezone.localdate()
    ).exclude(
        status=Task.STATUS_DONE
    ).count()

    total_leads = Lead.objects.filter(
        company=company
    ).count()

    hot_leads = Lead.objects.filter(
        company=company,
        score__gte=70
    ).count()

    return {
        "active_employees": employees,
        "total_tasks": total_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "total_leads": total_leads,
        "hot_leads": hot_leads,
    }