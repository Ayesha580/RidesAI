from django.urls import path
from .views import SupportQuestionListView


urlpatterns = [
    path(
        "questions/",
        SupportQuestionListView.as_view(),
        name="support-questions"
    ),
]