from django.contrib import admin
from .models import SupportQuestion


@admin.register(SupportQuestion)
class SupportQuestionAdmin(admin.ModelAdmin):
    list_display = ("question", "is_active", "order", "created_at")
    list_filter = ("is_active",)
    search_fields = ("question", "answer")
    ordering = ("order", "-created_at")