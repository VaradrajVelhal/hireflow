import json
import re

from django.conf import settings
from google import genai
from google.genai import types

GEMINI_MODEL = "gemini-3.5-flash-lite"


class AIConfigurationError(Exception):
    """Raised when Gemini API credentials or configuration are missing."""


class AIResponseFormatError(Exception):
    """Raised when Gemini returns an empty, malformed, or unexpected response."""


def _parse_json_response(raw_text):
    if not raw_text or not isinstance(raw_text, str):
        raise AIResponseFormatError("AI service returned an empty response.")

    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise AIResponseFormatError("AI service returned invalid JSON.") from exc

    if not isinstance(data, dict):
        raise AIResponseFormatError("AI service returned an unexpected response structure.")

    return data


def _normalize_str_list(value):
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if item is not None and str(item).strip()]


def _validate_match_payload(data):
    if "match_score" not in data:
        raise AIResponseFormatError("AI response is missing 'match_score'.")

    try:
        score = int(round(float(data["match_score"])))
    except (TypeError, ValueError) as exc:
        raise AIResponseFormatError("AI response has an invalid 'match_score'.") from exc

    score = max(0, min(100, score))

    return {
        "match_score": score,
        "score_reason": str(data.get("score_reason") or "").strip(),
        "matching_skills": _normalize_str_list(data.get("matching_skills")),
        "missing_skills": _normalize_str_list(data.get("missing_skills")),
        "strengths": _normalize_str_list(data.get("strengths")),
        "weaknesses": _normalize_str_list(data.get("weaknesses")),
        "resume_improvements": _normalize_str_list(data.get("resume_improvements")),
        "interview_topics": _normalize_str_list(data.get("interview_topics")),
    }


class AIMatchService:
    def __init__(self):
        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key or not str(api_key).strip():
            raise AIConfigurationError("GEMINI_API_KEY is not configured.")

        self.client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=25000),
        )

    def analyze_match(self, resume_text, job_description):
        prompt = f"""
You are an expert technical recruiter.

Compare this resume with the job description.

Resume:
{resume_text}

Job Description:
{job_description}

Return ONLY valid JSON in this exact format:

{{
  "match_score": 0,
  "score_reason": "A 2-3 sentence summary explaining the score, matching areas, and major gaps.",
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

        parsed = _parse_json_response(getattr(response, "text", None))
        return _validate_match_payload(parsed)
