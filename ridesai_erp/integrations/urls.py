from django.urls import path

from . import views

urlpatterns = [

    path(
        "google/login/",
        views.google_login,
    ),

    path(
        "google/callback/",
        views.google_callback,
    ),

    path(
        "mailbox/",
        views.mailbox_status,
    ),

    path(
        "disconnect/",
        views.disconnect_mailbox,
    ),

    path(
        "send-test/",
        views.send_test_email,
    ),

]