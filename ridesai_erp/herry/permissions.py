from accounts.models import User


def is_owner(user):
    return (
        user.is_authenticated
        and user.role == User.ROLE_OWNER
    )


def is_hr(user):
    return (
        user.is_authenticated
        and user.role == User.ROLE_HR
    )


def is_manager(user):
    return (
        user.is_authenticated
        and user.role == User.ROLE_MANAGER
    )


def is_employee(user):
    return (
        user.is_authenticated
        and user.role == User.ROLE_EMPLOYEE
    )


def can_use_herry(user):
    return (
        user.is_authenticated
        and user.role in [
            User.ROLE_OWNER,
            User.ROLE_HR,
            User.ROLE_MANAGER,
            User.ROLE_EMPLOYEE,
        ]
    )