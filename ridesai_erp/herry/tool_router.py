from accounts.models import User

from .services.employee import (
    get_my_tasks,
    get_my_attendance,
    get_my_leave,
)

from .services.manager import (
    get_my_team,
    get_team_tasks,
)

from .services.hr import (
    get_employees,
    get_employee_attendance,
    get_leave_summary,
    get_hiring_data as get_hr_hiring_data,
)

from .services.performance import (
    get_employee_performance,
)

from .services.crm import (
    get_hot_leads,
)

from .services.owner import (
    get_business_overview,
)

from .services.hiring import (
    get_hiring_data,
)

from .quota import (
    get_herry_plan_info,
)


# =========================================================
# HERRY PLAN TOOL
# =========================================================

def get_my_plan(user):
    return get_herry_plan_info(user.company)


# =========================================================
# READ-ONLY HERRY TOOLS
# =========================================================


# ---------------------------------------------------------
# Employee tools
# ---------------------------------------------------------

EMPLOYEE_TOOLS = {
    "get_my_tasks": get_my_tasks,
    "get_my_attendance": get_my_attendance,
    "get_my_leave": get_my_leave,
    "get_my_plan": get_my_plan,
}


# ---------------------------------------------------------
# Manager tools
# ---------------------------------------------------------

MANAGER_TOOLS = {
    "get_my_tasks": get_my_tasks,
    "get_my_attendance": get_my_attendance,
    "get_my_leave": get_my_leave,

    "get_my_team": get_my_team,
    "get_team_tasks": get_team_tasks,

    "get_employee_performance": get_employee_performance,

    "get_my_plan": get_my_plan,
}


# ---------------------------------------------------------
# HR tools
# ---------------------------------------------------------

HR_TOOLS = {
    "get_employees": get_employees,
    "get_employee_attendance": get_employee_attendance,
    "get_leave_summary": get_leave_summary,
    "get_hiring_data": get_hr_hiring_data,
    "get_employee_performance": get_employee_performance,

    "get_my_plan": get_my_plan,
}


# ---------------------------------------------------------
# Owner tools
# ---------------------------------------------------------

OWNER_TOOLS = {
    "get_business_overview": get_business_overview,
    "get_employees": get_employees,
    "get_employee_attendance": get_employee_attendance,
    "get_leave_summary": get_leave_summary,
    "get_employee_performance": get_employee_performance,
    "get_hiring_data": get_hiring_data,
    "get_hot_leads": get_hot_leads,

    "get_my_plan": get_my_plan,
}


# ---------------------------------------------------------
# Role → Allowed Tools
# ---------------------------------------------------------

ROLE_TOOLS = {
    User.ROLE_OWNER: OWNER_TOOLS,
    User.ROLE_HR: HR_TOOLS,
    User.ROLE_MANAGER: MANAGER_TOOLS,
    User.ROLE_EMPLOYEE: EMPLOYEE_TOOLS,
}


# ---------------------------------------------------------
# Get Available Tools
# ---------------------------------------------------------

def get_available_tools(user):
    """
    Return only the READ-ONLY tools allowed
    for the authenticated user's role.
    """

    if not user:
        return {}

    if not user.is_authenticated:
        return {}

    if not user.company:
        return {}

    return ROLE_TOOLS.get(user.role, {})


# ---------------------------------------------------------
# Execute Tool
# ---------------------------------------------------------

def execute_tool(user, tool_name):
    """
    Execute an approved READ-ONLY Herry tool.
    """

    tools = get_available_tools(user)

    tool = tools.get(tool_name)

    if not tool:
        raise PermissionError(
            f"You are not allowed to use Herry tool: {tool_name}"
        )

    return tool(user)