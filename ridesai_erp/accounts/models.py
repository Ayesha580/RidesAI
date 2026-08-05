from django.contrib.auth.models import AbstractUser
from django.db import models

from companies.models import Company


class User(AbstractUser):

    ROLE_OWNER = 'owner'
    ROLE_MANAGER = 'manager'
    ROLE_EMPLOYEE = 'employee'
    ROLE_HR = 'hr'
    ROLE_ACCOUNTANT = 'accountant'
    ROLE_SUPERADMIN = 'superadmin'

    ROLE_CHOICES = [
        (ROLE_OWNER, 'Business Owner'),
        (ROLE_MANAGER, 'Manager'),
        (ROLE_EMPLOYEE, 'Employee'),
        (ROLE_ACCOUNTANT, 'Accountant'),
        (ROLE_SUPERADMIN, 'Rides AI Super Admin'),
        (ROLE_HR, 'Hr')
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_EMPLOYEE
    )

    company = models.ForeignKey(
        Company,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='users'
    )

    phone = models.CharField(
        max_length=30,
        blank=True
    )

    cnic = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True
    )

    must_change_password = models.BooleanField(
        default=False
    )
    def is_manager_level(self):
        return self.role in (
            self.ROLE_OWNER, self.ROLE_MANAGER,self.ROLE_HR,
            self.ROLE_ACCOUNTANT, self.ROLE_SUPERADMIN,
        )

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.ROLE_SUPERADMIN

        super().save(*args, **kwargs)

    def can_manage_all_leads(self):
        return self.is_manager_level()

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'