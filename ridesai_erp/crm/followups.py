from datetime import timedelta
from django.utils import timezone
from django.utils.html import strip_tags

from .models import FollowUpActivity
from integrations.services import get_mailbox
from integrations.gmail import send_html_email
from integrations.models import Mailbox


def create_followups_for_lead(lead):
    now = timezone.now()

    if lead.score >= 70:
        FollowUpActivity.objects.create(
            lead=lead, activity_type=FollowUpActivity.TYPE_CALL,
            scheduled_at=now + timedelta(hours=1),
            message="High priority lead — call within 1 hour."
        )
        create_email_followup(lead, scheduled_at=now)
        FollowUpActivity.objects.create(
            lead=lead, activity_type=FollowUpActivity.TYPE_REMINDER,
            scheduled_at=now + timedelta(days=1),
            message="Follow up with high-value lead."
        )
        lead.next_followup_date = (now + timedelta(days=1)).date()

    elif lead.score >= 40:
        create_email_followup(lead, scheduled_at=now)
        FollowUpActivity.objects.create(
            lead=lead, activity_type=FollowUpActivity.TYPE_CALL,
            scheduled_at=now + timedelta(days=2),
            message="Medium priority lead — follow-up call."
        )
        lead.next_followup_date = (now + timedelta(days=2)).date()

    else:
        create_email_followup(lead, scheduled_at=now)
        FollowUpActivity.objects.create(
            lead=lead, activity_type=FollowUpActivity.TYPE_REMINDER,
            scheduled_at=now + timedelta(days=3),
            message="Low priority lead — check status."
        )
        lead.next_followup_date = (now + timedelta(days=3)).date()

    lead.save(update_fields=["next_followup_date"])


def create_email_followup(lead, scheduled_at):
    activity = FollowUpActivity.objects.create(
        lead=lead, activity_type=FollowUpActivity.TYPE_EMAIL,
        scheduled_at=scheduled_at,
        message=f"Hi {lead.full_name}, thank you for your interest. Our team will be in touch soon.",
    )
    if lead.email:
        send_actual_email(lead, activity)
    return activity


def build_email_html(lead):
    company_name = lead.company.name if lead.company else "Our Team"

    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#fdf6ff; font-family:Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ff; padding:30px 0;">
            <tr>
                <td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(190,39,238,.08);">

                        <tr>
                            <td style="background-color:#BE27EE; padding:28px 30px; text-align:center;">
                                <h1 style="margin:0; color:#ffffff; font-size:22px; letter-spacing:.5px;">
                                    {company_name}
                                </h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:32px 30px;">
                                <p style="margin:0 0 16px; font-size:16px; color:#4a1d5c;">
                                    Hi <strong>{lead.full_name}</strong>,
                                </p>

                                <p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:#7a5a8c;">
                                    Thank you for showing interest in <strong style="color:#BE27EE;">{company_name}</strong>.
                                    We've received your details and our team is already reviewing them.
                                </p>

                                <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#7a5a8c;">
                                    One of our representatives will reach out to you shortly to discuss
                                    how we can help with your requirements.
                                </p>

                                <table cellpadding="0" cellspacing="0" style="width:100%; background:#fdf1ff; border-radius:12px; padding:16px;">
                                    <tr>
                                        <td style="padding:16px; font-size:13px; color:#a06bb8;">
                                            📞 <strong style="color:#5a2670;">Phone:</strong> {lead.phone or "—"}<br>
                                            📍 <strong style="color:#5a2670;">Location:</strong> {lead.location or "—"}
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:24px 0 0; font-size:13px; color:#c9a3da;">
                                    If you have any questions in the meantime, feel free to reply to this email.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:20px 30px; background:#fdf1ff; text-align:center;">
                                <p style="margin:0; font-size:12px; color:#c9a3da;">
                                    © {company_name} — Powered by Rides AI
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def send_actual_email(lead, activity):
    try:
        company_name = lead.company.name if lead.company else "Our Team"
        html_content = build_email_html(lead)
        text_content = strip_tags(html_content)

        # Company ki connected Gmail mailbox nikalein (token refresh bhi khud handle karta hai)
        mailbox = get_mailbox(lead.company)

        send_html_email(
            mailbox=mailbox,
            to_email=lead.email,
            subject=f"Thank you for your interest in {company_name}",
            text_body=text_content,
            html_body=html_content,
        )

        activity.status = FollowUpActivity.STATUS_SENT

    except Mailbox.DoesNotExist:
        # Company ne abhi Gmail connect nahi ki — activity ko failed mark karein
        activity.status = FollowUpActivity.STATUS_FAILED

    except Exception:
        activity.status = FollowUpActivity.STATUS_FAILED

    activity.save(update_fields=["status"])


def send_whatsapp_followup(lead, activity):
    """Placeholder — jab provider decide ho jaye (Twilio/Meta) to yahan integrate karenge."""
    activity.status = FollowUpActivity.STATUS_PENDING
    activity.save(update_fields=["status"])