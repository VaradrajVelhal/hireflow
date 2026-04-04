from django.urls import path
from .views import ApplicationCreateView, ApplicationDeleteView, ApplicationUpdateView, DashboardView, DueTodayView, JobListView, MatchScoreView, MyApplicationsView

urlpatterns = [
    path('jobs/', JobListView.as_view()),
    path('apply/', ApplicationCreateView.as_view()),
    path('application/<int:pk>/', ApplicationUpdateView.as_view()),
    path('application/delete/<int:pk>/', ApplicationDeleteView.as_view()),
    path('my-applications/', MyApplicationsView.as_view()),
    path('dashboard/', DashboardView.as_view()),
    path('match-score/', MatchScoreView.as_view()),
    path('due-today/', DueTodayView.as_view()),
]