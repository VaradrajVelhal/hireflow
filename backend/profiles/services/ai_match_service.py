import json

from django.conf import settings
from google import genai
from google.genai import types


class AIMatchService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=25000)
        )

    def analyze_match(self, resume_text, job_description,):
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
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```"):
            lines = text.splitlines()
            text = "\n".join(lines[1:-1])

        return json.loads(text)