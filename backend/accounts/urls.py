from django.urls import path
from .views import RegisterView, VerifyEmailView, CustomLoginView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('verify-email/<int:uid>/<str:token>/', VerifyEmailView.as_view()),
    path('login/', CustomLoginView.as_view()),
]