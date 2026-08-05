from django.contrib import admin
from .models import Company, Plan

admin.site.register(Plan)
admin.site.register(Company)