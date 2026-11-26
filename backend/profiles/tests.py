from types import SimpleNamespace
from unittest.mock import patch

import fitz
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from google.genai.errors import APIError
from rest_framework.test import APITestCase

from jobs.models import Job

User = get_user_model()


def _make_pdf_bytes(text=None):
    doc = fitz.open()
    page = doc.new_page()
    if text:
        page.insert_text((72, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class ProfileResumeAndMatchTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=self.user)
        self.job = Job.objects.create(
            title="Python Backend Engineer",
            company="HireFlow",
            location="Remote",
            source="api",
            description="<p>Looking for Python, Django, and PostgreSQL experience.</p>",
        )

    def test_upload_valid_pdf_and_match_success(self):
        pdf_file = SimpleUploadedFile(
            "resume.pdf",
            _make_pdf_bytes("Python Django PostgreSQL developer with 4 years experience"),
            content_type="application/pdf",
        )
        with patch("profiles.views.AIResumeService") as mock_resume_cls:
            mock_resume_cls.return_value.extract_resume_data.return_value = {"skills": ["Python"]}
            upload_res = self.client.post("/api/profile/resume/", {"resume": pdf_file}, format="multipart")
        self.assertEqual(upload_res.status_code, 200)

        fake_gemini_response = SimpleNamespace(
            text=(
                '{"match_score": 88, "score_reason": "Strong Python and Django fit.", '
                '"matching_skills": ["Python", "Django"], "missing_skills": ["PostgreSQL"], '
                '"strengths": ["Backend APIs"], "weaknesses": ["No DB listed"], '
                '"resume_improvements": ["Add PostgreSQL"], "interview_topics": ["Django ORM"]}'
            )
        )
        with override_settings(GEMINI_API_KEY="test-key"), patch(
            "profiles.services.ai_match_service.genai.Client"
        ) as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.return_value = fake_gemini_response
            match_res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")

        self.assertEqual(match_res.status_code, 200)
        self.assertEqual(match_res.data["match_score"], 88)
        self.assertEqual(match_res.data["matching_skills"], ["Python", "Django"])

    def test_match_missing_resume(self):
        res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("upload your resume", res.data["error"].lower())

    def test_upload_corrupted_pdf_returns_meaningful_error(self):
        bad_pdf = SimpleUploadedFile(
            "corrupted.pdf",
            b"not-a-real-pdf-binary",
            content_type="application/pdf",
        )
        res = self.client.post("/api/profile/resume/", {"resume": bad_pdf}, format="multipart")
        self.assertEqual(res.status_code, 400)
        self.assertIn("corrupted", res.data["error"].lower())
        self.user.profile.refresh_from_db()
        self.assertFalse(bool(self.user.profile.resume))

    def test_upload_empty_text_pdf_returns_meaningful_error(self):
        empty_pdf = SimpleUploadedFile(
            "scanned.pdf",
            _make_pdf_bytes(text=None),
            content_type="application/pdf",
        )
        res = self.client.post("/api/profile/resume/", {"resume": empty_pdf}, format="multipart")
        self.assertEqual(res.status_code, 400)
        self.assertIn("could not extract text", res.data["error"].lower())

    def _prepare_resume_text(self):
        profile = self.user.profile
        profile.resume_text = "Python Django developer"
        profile.save(update_fields=["resume_text"])

    def test_match_invalid_gemini_credentials(self):
        self._prepare_resume_text()
        api_err = APIError(403, {"error": {"message": "API key not valid", "status": "PERMISSION_DENIED"}})
        with override_settings(GEMINI_API_KEY="bad-key"), patch(
            "profiles.services.ai_match_service.genai.Client"
        ) as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.side_effect = api_err
            res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")

        self.assertEqual(res.status_code, 502)
        self.assertIn("authentication failed", res.data["error"].lower())
        self.assertNotIn("bad-key", str(res.data))

    def test_match_unavailable_model(self):
        self._prepare_resume_text()
        api_err = APIError(404, {"error": {"message": "Model not found", "status": "NOT_FOUND"}})
        with override_settings(GEMINI_API_KEY="test-key"), patch(
            "profiles.services.ai_match_service.genai.Client"
        ) as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.side_effect = api_err
            res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")

        self.assertEqual(res.status_code, 502)
        self.assertIn("model", res.data["error"].lower())

    def test_match_rate_limit_or_quota(self):
        self._prepare_resume_text()
        api_err = APIError(429, {"error": {"message": "Quota exceeded", "status": "RESOURCE_EXHAUSTED"}})
        with override_settings(GEMINI_API_KEY="test-key"), patch(
            "profiles.services.ai_match_service.genai.Client"
        ) as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.side_effect = api_err
            res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")

        self.assertEqual(res.status_code, 429)
        self.assertIn("rate limit", res.data["error"].lower())

    def test_match_unexpected_gemini_response(self):
        self._prepare_resume_text()
        bad_resp = SimpleNamespace(text="Sure! Here is your analysis without JSON.")
        with override_settings(GEMINI_API_KEY="test-key"), patch(
            "profiles.services.ai_match_service.genai.Client"
        ) as mock_client_cls:
            mock_client_cls.return_value.models.generate_content.return_value = bad_resp
            res = self.client.post("/api/profile/match/", {"job_id": self.job.id}, format="json")

        self.assertEqual(res.status_code, 502)
        self.assertIn("unexpected response", res.data["error"].lower())
