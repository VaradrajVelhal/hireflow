import logging
import os

from google.genai.errors import APIError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from jobs.models import Job

from .serializers import MatchJobSerializer, ResumeUploadSerializer
from .services.ai_match_service import (
    AIConfigurationError,
    AIMatchService,
    AIResponseFormatError,
)
from .services.ai_resume_service import AIResumeService
from .utils import ResumeExtractionError, extract_resume_text

logger = logging.getLogger(__name__)


def _clear_profile_resume(profile):
    if profile.resume:
        profile.resume.delete(save=False)
    profile.resume = None
    profile.resume_text = ""
    profile.extracted_data = {}
    profile.save()


def _map_gemini_api_error(exc, job_id):
    code = getattr(exc, "code", None)
    api_status = str(getattr(exc, "status", "") or "").upper()
    msg_lower = str(exc).lower()

    logger.error(
        "Gemini APIError matching job %s (code=%s, status=%s)",
        job_id,
        code,
        api_status,
    )

    if (
        code in (401, 403)
        or api_status in ("UNAUTHENTICATED", "PERMISSION_DENIED")
        or "api key" in msg_lower
        or "permission" in msg_lower
        or "unauthenticated" in msg_lower
    ):
        return Response(
            {
                "error": "AI service authentication failed. Please check the server Gemini API key configuration."
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if code == 404 or api_status == "NOT_FOUND" or "not found" in msg_lower:
        return Response(
            {
                "error": "Configured AI model is currently unavailable. Please verify the Gemini model configuration."
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if (
        code == 429
        or api_status == "RESOURCE_EXHAUSTED"
        or "quota" in msg_lower
        or "rate" in msg_lower
    ):
        return Response(
            {
                "error": "AI service rate limit or quota exceeded. Please wait a moment and try again."
            },
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    if code in (408, 504) or api_status == "DEADLINE_EXCEEDED" or "timeout" in msg_lower:
        return Response(
            {"error": "AI service request timed out. Please try again."},
            status=status.HTTP_504_GATEWAY_TIMEOUT,
        )

    return Response(
        {"error": "AI service temporarily unavailable. Please try again later."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = request.user.profile

        serializer = ResumeUploadSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()
        profile.refresh_from_db()

        try:
            text = extract_resume_text(profile.resume.path)
        except ResumeExtractionError as exc:
            logger.warning("Resume PDF extraction failed for user %s: %s", request.user.id, exc)
            _clear_profile_resume(profile)
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception("Unexpected error extracting resume PDF for user %s", request.user.id)
            _clear_profile_resume(profile)
            return Response(
                {"error": "Unable to process the uploaded PDF resume. Please try another file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.resume_text = text

        try:
            service = AIResumeService()
            profile.extracted_data = service.extract_resume_data(text)
        except Exception:
            logger.exception("Failed to analyze resume with Gemini for user %s.", request.user.id)
            profile.extracted_data = {}

        profile.save()

        return Response(
            {"message": "Resume uploaded successfully."},
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        _clear_profile_resume(request.user.profile)
        return Response(
            {"message": "Resume deleted successfully."},
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile

        resume_name = None
        if profile.resume:
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
                "is_ai_ready": bool((profile.resume_text or "").strip()),
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
                {"error": "Job not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        profile = request.user.profile
        resume_text = (profile.resume_text or "").strip()

        if not resume_text:
            if not profile.resume:
                return Response(
                    {"error": "Please upload your resume first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                resume_text = extract_resume_text(profile.resume.path)
                profile.resume_text = resume_text
                profile.save(update_fields=["resume_text"])
            except ResumeExtractionError as exc:
                logger.warning("Resume extraction failed during match for user %s: %s", request.user.id, exc)
                return Response(
                    {"error": str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not (job.description or "").strip():
            return Response(
                {"error": "Job description is not available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            service = AIMatchService()
            result = service.analyze_match(resume_text, job.description)
            return Response(result, status=status.HTTP_200_OK)

        except AIConfigurationError as exc:
            logger.error("Gemini configuration error matching job %s: %s", job_id, exc)
            return Response(
                {"error": "AI matching service is not configured on the server."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except AIResponseFormatError as exc:
            logger.warning("Invalid Gemini response format matching job %s: %s", job_id, exc)
            return Response(
                {"error": "AI service returned an unexpected response format. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except APIError as exc:
            return _map_gemini_api_error(exc, job_id)

        except TimeoutError as exc:
            logger.error("Timeout matching job %s with Gemini: %s", job_id, exc)
            return Response(
                {"error": "AI service request timed out. Please try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )

        except Exception as exc:
            if "timeout" in str(exc).lower():
                logger.error("Timeout matching job %s with Gemini: %s", job_id, exc)
                return Response(
                    {"error": "AI service request timed out. Please try again."},
                    status=status.HTTP_504_GATEWAY_TIMEOUT,
                )
            logger.exception("Failed to analyze job match with Gemini for job %s.", job_id)
            return Response(
                {"error": "Unable to analyze resume at the moment. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
