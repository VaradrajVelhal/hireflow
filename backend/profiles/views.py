import logging

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from jobs.models import Job

from .serializers import ResumeUploadSerializer, MatchJobSerializer
from .services.ai_match_service import AIMatchService
from .services.ai_resume_service import AIResumeService
from .utils import extract_resume_text
from google.genai.errors import APIError

logger = logging.getLogger(__name__)


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        serializer = ResumeUploadSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()

        # Reload profile after saving the uploaded file
        profile.refresh_from_db()

        text = extract_resume_text(profile.resume.path)

        if not text.strip():
            return Response(
                {
                    "error": "Could not extract text from the uploaded resume."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.resume_text = text

        try:
            service = AIResumeService()
            profile.extracted_data = service.extract_resume_data(text)
        except Exception:
            logger.exception("Failed to analyze resume with Gemini.")
            profile.extracted_data = {}

        profile.save()

        return Response(
            {
                "message": "Resume uploaded successfully."
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        profile = request.user.profile
        if profile.resume:
            profile.resume.delete(save=False)
        profile.resume = None
        profile.resume_text = ""
        profile.extracted_data = {}
        profile.save()

        return Response(
            {
                "message": "Resume deleted successfully."
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        
        resume_name = None
        if profile.resume:
            import os
            resume_name = os.path.basename(profile.resume.name)

        return Response(
            {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "date_joined": user.date_joined,
                "resume_name": resume_name,
                "resume_url": profile.resume.url if profile.resume else None,
                "uploaded_at": profile.uploaded_at,
                "is_ai_ready": bool(profile.resume_text.strip()),
            },
            status=status.HTTP_200_OK,
        )



class MatchJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MatchJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job_id = serializer.validated_data["job_id"]

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response(
                {
                    "error": "Job not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = request.user.profile

        if not profile.resume_text:
            return Response(
                {
                    "error": "Please upload your resume first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not job.description:
            return Response(
                {
                    "error": "Job description is not available."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = AIMatchService()

            result = service.analyze_match(
                profile.resume_text,
                job.description,
            )

            return Response(result, status=status.HTTP_200_OK)

        except APIError as e:
            logger.error(f"Gemini APIError matching job {job_id}: {str(e)}")
            if e.code == 408 or e.code == 504 or "timeout" in str(e).lower():
                return Response(
                    {"error": "AI service request timed out. Please try again."},
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            return Response(
                {"error": "AI service temporarily unavailable. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except (TimeoutError, Exception) as e:
            if isinstance(e, TimeoutError) or "timeout" in str(e).lower():
                logger.error(f"Timeout matching job {job_id} with Gemini: {str(e)}")
                return Response(
                    {"error": "AI service request timed out. Please try again."},
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            logger.exception("Failed to analyze job match with Gemini.")

            return Response(
                {
                    "error": "Unable to analyze resume at the moment. Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )