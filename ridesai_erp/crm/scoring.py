HIGH_VALUE_CATEGORIES = ["technology", "finance", "healthcare", "real estate"]
HIGH_VALUE_LOCATIONS = ["karachi", "lahore", "islamabad"]


def calculate_lead_score(lead):
    score = 0

    if lead.company_size:
        if lead.company_size >= 500:
            score += 30
        elif lead.company_size >= 100:
            score += 20
        elif lead.company_size >= 20:
            score += 10
        else:
            score += 5

    if lead.category and lead.category.strip().lower() in HIGH_VALUE_CATEGORIES:
        score += 25
    elif lead.category:
        score += 10

    if lead.location and lead.location.strip().lower() in HIGH_VALUE_LOCATIONS:
        score += 20
    elif lead.location:
        score += 8

    if lead.email:
        score += 12
    if lead.phone:
        score += 13

    return min(score, 100)