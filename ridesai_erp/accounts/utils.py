from accounts.models import User


def get_used_seats(company):

    return User.objects.filter(
        company=company
    ).exclude(
        role=User.ROLE_OWNER
    ).count()



def get_available_seats(company):

    used = get_used_seats(company)

    return company.seats - used