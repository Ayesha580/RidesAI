import ipaddress
from django.utils import timezone
from .models import Attendance

from math import radians, sin, cos, sqrt, atan2


def check_seat_limit(company, role_label="team member"):
    from accounts.models import User

    # Unlimited seats ONLY for RidesAI owner
    if company.email == "ahead@ridestechnologies.com":
        return None

    current_users = User.objects.filter(
        company=company,
        is_active=True
    ).exclude(role=User.ROLE_OWNER).count()

    if current_users >= company.seats:
        return {
            "error": (
                f"Unable to add {role_label} — your plan allows "
                f"{company.seats} seat{'s' if company.seats != 1 else ''}, "
                f"and you're currently using all {current_users}. "
                f"Please upgrade your plan to add more seats."
            ),
            "current_seats_used": current_users,
            "seat_limit": company.seats,
        }

    return None
    
def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371000  # meter

    lat1 = radians(lat1)
    lon1 = radians(lon1)

    lat2 = radians(lat2)
    lon2 = radians(lon2)


    dlat = lat2-lat1
    dlon = lon2-lon1


    a = (
        sin(dlat/2)**2
        +
        cos(lat1)
        *
        cos(lat2)
        *
        sin(dlon/2)**2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1-a)
    )


    return R*c

def get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def ip_allowed(company, client_ip):
    allowed = (company.allowed_ip_addresses or '').strip()
    if not allowed:
        return True
    if not client_ip:
        return False
    try:
        ip = ipaddress.ip_address(client_ip)
    except ValueError:
        return False
    for entry in allowed.split(','):
        entry = entry.strip()
        if not entry:
            continue
        try:
            if '/' in entry:
                if ip in ipaddress.ip_network(entry, strict=False):
                    return True
            elif ip == ipaddress.ip_address(entry):
                return True
        except ValueError:
            continue
    return False

def get_today_attendance(employee):
    attendance, _ = Attendance.objects.get_or_create(
        employee=employee,
        date=timezone.localdate(),
        defaults={"company": employee.company},
    )
    return attendance