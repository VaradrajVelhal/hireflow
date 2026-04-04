from rest_framework.views import APIView
from rest_framework.response import Response
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .serializers import RegisterSerializer
from .models import User
from .utils import email_token_generator
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed
from django.shortcuts import get_object_or_404


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            token = email_token_generator.make_token(user)
            uid = user.pk

            verify_url = f"http://localhost:8000/api/verify-email/{uid}/{token}/"

            subject = "Verify your email - HireFlow"

            text_content = f"Click here: {verify_url}"

            html_content = f"""
            <h2>Welcome to HireFlow</h2>
            <p>Hi {user.username},</p>
            <p>Please verify your email:</p>
            <a href="{verify_url}" style="padding:10px 15px; background:blue; color:white;">
            Verify Email
            </a>
            """

            email = EmailMultiAlternatives(
                subject,
                text_content,
                settings.EMAIL_HOST_USER,
                [user.email]
            )

            email.attach_alternative(html_content, "text/html")
            email.send()

            print("\nVERIFY LINK:\n", verify_url, "\n")

            return Response({"message": "User created. Check email."})

        return Response(serializer.errors)


class VerifyEmailView(APIView):
    def get(self, request, uid, token):
        user = get_object_or_404(User, pk=uid)

        if email_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified"})

        return Response({"error": "Invalid token"})


class CustomLoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        user = User.objects.get(username=request.data['username'])

        if not user.is_verified:
            raise AuthenticationFailed("Email not verified")

        return response