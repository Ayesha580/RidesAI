from django.urls import path
from . import views

app_name = "hr"

urlpatterns = [

path(
    "managers/",
    views.ManagerCreateAPIView.as_view(),
),
path(
    "managers/list/",
    views.ManagerListAPIView.as_view(),
),
path(
    "managers/update/",
    views.ManagerDetailAPIView.as_view(),
),
path(
    "managers/<int:pk>/delete/",
    views.ManagerDeleteAPIView.as_view(),
    name="manager-delete",
),

path(
    "manager/team/",
    views.ManagerTeamAPIView.as_view()
),

path(
    "manager/tasks/",
    views.ManagerCreateTaskAPIView.as_view()
),

path(
    "manager/tasks/list/",
    views.ManagerTaskListAPIView.as_view()
),

#manager owner task or hr own task
path(
    "manager/mytasks/",
    views.ManagerTaskAPIView.as_view()
),
path(
    "hr/tasks/",
    views.HRTaskAPIView.as_view()
),
    #-----------------------------
path(
    "manager/tasks/<int:pk>/delete/",
    views.ManagerDeleteTaskAPIView.as_view()
),
path(
    "employee/tasks/<int:pk>/complete/",
    views.EmployeeCompleteTaskAPIView.as_view()
),
path(
        "tasks/<int:pk>/update/",
        views.TaskUpdateAPIView.as_view(),
        name="task-update"
    ),

    # ---------- Employees ----------
    path("employees/", views.employee_list, name="employee-list"),
    path("employees/add/", views.employee_add, name="employee_add"),
    path("employees/add/api/", views.add_employee, name="employee-add-api"),
path(
    "employee/tasks/",
    views.EmployeeTaskListAPIView.as_view()
),

    path("employees/list/api/", views.employee_list_api, name="employee-list-api"),
    path("employees/<int:employee_id>/remove/", views.remove_employee, name="employee-remove"),
    path(

            "employee/profile/",

            views.EmployeeProfileAPIView.as_view(),

            name="employee-profile"

        ),
        path("employee/screenshots/upload/", views.UploadScreenshotAPIView.as_view()),
        path("screenshots/", views.ScreenshotListAPIView.as_view()),
        path("company/office-hours/", views.OfficeHoursAPIView.as_view(), name="office-hours"),    
    path(

        "documents/",

        views.EmployeeDocumentAPIView.as_view(),

        name="employee-documents"

    ),
    path(
            "attendance/check-in/",
            views.CheckInAPIView.as_view()
        ),

        path(
            "attendance/check-out/",
            views.CheckOutAPIView.as_view()
        ),

        path(
            "attendance/break-start/",
            views.BreakStartAPIView.as_view()
        ),

        path(
            "attendance/break-end/",
            views.BreakEndAPIView.as_view()
        ),
path(
    "employee/set-location/",
    views.SetAttendanceLocationAPIView.as_view()
),
path(
    "employee/leaves/apply/",
    views.ApplyLeaveAPIView.as_view()
),
path(
    "employee/leaves/",
    views.EmployeeLeaveListAPIView.as_view()
),
path(
        "employee/notifications/",
        views.EmployeeNotificationListAPIView.as_view(),
        name="employee-notifications",
    ),
path(
        "employee/notifications/",
        views.EmployeeNotificationListAPIView.as_view(),
        name="employee-notifications",
    ),
path(
    "announcements/create/",
    views.CreateAnnouncementAPIView.as_view()
),

path(
    "employee/announcements/",
    views.EmployeeAnnouncementAPIView.as_view()
),
path(
    "owner/announcements/",
    views.OwnerAnnouncementAPIView.as_view()
),
path(
    "manager/announcements/",
    views.ManagerAnnouncementAPIView.as_view()
),
path(
    "announcements/",
    views.HRAnnouncementAPIView.as_view()
),


    path(
        "employee/notifications/<int:pk>/read/",
        views.ReadNotificationAPIView.as_view(),
        name="read-notification",
    ),

path(
    "hr/leaves/",
    views.LeaveListAPIView.as_view()
),

path(
    "hr/leaves/<int:pk>/status/",
    views.LeaveStatusAPIView.as_view()
),
path(
    "leaves/",
    views.HRLeaveListAPIView.as_view()
),

path(
    "leaves/<int:pk>/status/",
    views.LeaveStatusAPIView.as_view()
),

# ---------- Employee attendance widget (matches frontend axios calls) ----------
    path(
        "employee/attendance/today/",
        views.TodayAttendanceAPIView.as_view(),
        name="employee-attendance-today",
    ),
    path(
        "employee/checkin/",
        views.CheckInAPIView.as_view(),
        name="employee-checkin",
    ),
    path(
        "employee/checkout/",
        views.CheckOutAPIView.as_view(),
        name="employee-checkout",
    ),
    path(
        "employee/break/start/",
        views.BreakStartAPIView.as_view(),
        name="employee-break-start",
    ),
    path(
        "employee/break/end/",
        views.BreakEndAPIView.as_view(),
        name="employee-break-end",
    ),
path("attendance/today/", views.TodayAttendanceAPIView.as_view(), name="api-attendance-today"),
    path("attendance/my-history/", views.MyAttendanceHistoryAPIView.as_view(), name="api-attendance-my-history"),

    # ---------- HR (Owner-managed) ----------
    path("add-hr/", views.add_hr, name="add-hr"),
    path("hr-list/", views.hr_list, name="hr-list"),
path(
    "attendance/company/",
    views.CompanyAttendanceAPIView.as_view(),
    name="company-attendance",
),
    # ---------- Attendance ----------
    path("attendance/", views.clock_in_out, name="attendance-today"),
    path("attendance/history/", views.attendance_list, name="attendance-list"),
    path("attendance/break/", views.break_toggle, name="attendance-break"),
# ---------- Jobs API ----------

path("applications/", views.applicant_list),
path("applications/add/", views.add_applicant),
path("applications/<int:pk>/update/", views.update_applicant),
path("applications/<int:pk>/delete/", views.delete_applicant),
path("applications/upload-csv/", views.upload_applicants_csv),
path("applications/sample-csv/", views.download_sample_csv),
path("applications/<int:pk>/status/", views.update_applicant_status),

path(
    "offer-letters/",
    views.offer_letters,
    name="offer-letters"
),

path(
    "offer-letter/create/",
    views.generate_offer,
    name="generate-offer"
),

    #------- Tasks ----------
    path("tasks/", views.task_list, name="task-list"),
    path("tasks/add/", views.task_add, name="task-add"),
    path("tasks/<int:pk>/edit/", views.task_edit, name="task-edit"),

    # ---------- Employee self-service (login required, role=EMPLOYEE) ----------
    path("employee/login/", views.employee_login, name="employee-login"),
    path("employee/attendance/", views.employee_attendance, name="employee-attendance"),
    path("employee/break/", views.employee_break, name="employee-break"),
    path("employee/tasks/", views.my_tasks, name="my-tasks"),
    path("timezones/", views.timezone_list),

    # owner task create
    path(
        "owner/task-users/",
        views.OwnerTaskUsersAPIView.as_view()
    ),
    path(
            "owner/tasks/create/",
            views.OwnerCreateTaskAPIView.as_view()
        ),
    path(
            "tasks/create/",
            views.TaskCreateAPIView.as_view()
        ),
    path(
        "owner/tasks/",
        views.OwnerTaskAPIView.as_view()
    ),
    path(
        "hr/tasks/",
        views.HRTaskAPIView.as_view()
    ),

    path(
        "employee/tasks/",
        views.EmployeeTaskAPIView.as_view()
    ),
]