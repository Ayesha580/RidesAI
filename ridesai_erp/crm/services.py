# from datetime import timedelta
# from django.utils import timezone
#
# from .models import Lead
#
# FOLLOWUP_DAYS = {
#     Lead.STATUS_NEW: 1,
#     Lead.STATUS_CONTACTED: 2,
#     Lead.STATUS_INTERESTED: 3,
#     Lead.STATUS_NOT_ANSWERING: 2,
# }
#
#
# def schedule_next_followup(lead):
#     if lead.is_closed():
#         lead.next_followup_date = None
#     else:
#         days = FOLLOWUP_DAYS.get(lead.status, 3)
#         lead.next_followup_date = timezone.localdate() + timedelta(days=days)
#     lead.save(update_fields=['next_followup_date'])