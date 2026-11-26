import json
import re

from django.conf import settings
from google import genai
from google.genai import types

from .ai_match_service import AIConfigurationError, GEMINI_MODEL, _parse_json_response


class AIResumeService:
    def __init__(self):
        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key or not str(api_key).strip():
            raise AIConfigurationError("GEMINI_API_KEY is not configured.")

        self.client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=25000),
        )

    def extract_resume_data(self, resume_text):
        prompt = f"""
You are an expert technical recruiter.

Compare the candidate's resume with the job description.

Resume:
{resume_text}


Scoring Rules:
1. Focus primarily on the REQUIRED skills.
2. If all required skills are present, the match score should be close to 100.
3. Each missing required skill should significantly reduce the score.
4. Nice-to-have skills should have only a small impact.
5. Consider relevant project experience and domain knowledge as supporting factors.
6. Return an INTEGER between 0 and 100.

Return ONLY valid JSON in this exact format:

{{
  "match_score": 0,
  "score_reason": "",
  "matching_skills": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "resume_improvements": [],
  "interview_topics": []
}}
"""

        response = self.client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        return _parse_json_response(getattr(response, "text", None))