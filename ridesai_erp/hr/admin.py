from django.contrib import admin
from .models import (
    Employee,
    Attendance,
    Task,
    Break,
    Team,
)

admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(Task)
admin.site.register(Break)
admin.site.register(Team)