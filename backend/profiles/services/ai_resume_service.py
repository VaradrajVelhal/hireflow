import json

from django.conf import settings
from google import genai


class AIResumeService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

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
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )

        text = response.text.strip()

        # Remove markdown code fences if present
        if text.startswith("```"):
            lines = text.splitlines()
            text = "\n".join(lines[1:-1])

        return json.loads(text)