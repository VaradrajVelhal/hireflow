from django.urls import path
from .views import ResumeUploadView, MatchJobView, ProfileView

urlpatterns = [
    path("profile/", ProfileView.as_view(), name="profile-detail"),
    path("profile/resume/", ResumeUploadView.as_view(), name="resume-upload"),
    path("profile/match/", MatchJobView.as_view(), name="match-job"),
]