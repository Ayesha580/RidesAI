from django.db.models.signals import post_delete
from django.dispatch import receiver
from accounts.models import User

@receiver(post_delete, sender=User)
def delete_company_when_owner_deleted(sender, instance, **kwargs):
    if (
        instance.role == User.ROLE_OWNER
        and instance.company
        and not instance.company.users.exclude(id=instance.id).exists()
    ):
        instance.company.delete()