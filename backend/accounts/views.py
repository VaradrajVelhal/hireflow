from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from .serializers import RegisterSerializer
from .utils import email_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_verified = True
            user.save()
            token = email_token_generator.make_token(user)
            uid = user.pk

            verify_url = f"https://hireflow-1-qr4c.onrender.com/api/verify-email/{uid}/{token}/"

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
            try:
                email.send()
            except Exception as e:
                print(f"Failed to send email: {e}")

            print("\nVERIFY LINK:\n", verify_url, "\n")

            return Response(
                {"message": "Registration successful. Please verify your email before logging in."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    def get(self, request, uid, token):
        user = get_object_or_404(User, pk=uid)

        if email_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response({"message": "Email verified"})

        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {"message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_verified:
            print("User not verified, allowing login for now")

        # User is authenticated and verified — issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })