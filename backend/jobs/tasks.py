import logging
import requests
from datetime import date
from django.core.mail import send_mail
from django.conf import settings
from .models import Application, Job

logger = logging.getLogger(__name__)


def send_followup_reminders():
    print("FUNCTION STARTED")

    today = date.today()
    print("Today's date:", today)

    applications = Application.objects.filter(follow_up_date=today)
    print("Applications found:", applications.count())

    for app in applications:
        print("Sending email for:", app.job.title)

        send_mail(
            'Follow-up Reminder',
            f'Hi {app.user.username}, follow up for {app.job.title}',
            settings.EMAIL_HOST_USER,
            [app.user.email]
        )


def fetch_jobs_from_api():
    logger.info("Starting job ingestion task...")
    url = "https://remotive.com/api/remote-jobs"
    
    summary = {
        "fetched": 0,
        "created": 0,
        "duplicates": 0,
        "skipped": 0
    }

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Remotive API request failed: {e}")
        return summary

    try:
        data = response.json()
    except ValueError as e:
        logger.error(f"Remotive API response JSON parsing failed: {e}")
        return summary

    if not isinstance(data, dict) or "jobs" not in data:
        logger.error("Remotive API response is missing the 'jobs' key or is not a dictionary.")
        return summary

    jobs_list = data["jobs"]
    if not isinstance(jobs_list, list):
        logger.error("Remotive API 'jobs' value is not a list.")
        return summary

    jobs_to_process = jobs_list[:50]
    summary["fetched"] = len(jobs_to_process)

    for item in jobs_to_process:
        try:
            if not isinstance(item, dict):
                logger.warning("Skipping job item because it is not a dictionary.")
                summary["skipped"] += 1
                continue

            title = item.get("title")
            company = item.get("company_name")

            if not title or not company or not title.strip() or not company.strip():
                logger.warning("Skipping job due to missing or empty essential title/company fields.")
                summary["skipped"] += 1
                continue

            title = title.strip()
            company = company.strip()

            # Case-insensitive duplicate check
            if Job.objects.filter(title__iexact=title, company__iexact=company).exists():
                logger.info(f"Duplicate skipped (case-insensitive): {title} at {company}")
                summary["duplicates"] += 1
                continue

            location = item.get("candidate_required_location") or ""
            description = item.get("description") or ""
            apply_link = item.get("url") or ""

            Job.objects.create(
                title=title,
                company=company,
                location=location,
                salary=None,
                source="api",
                description=description,
                apply_link=apply_link
            )

            summary["created"] += 1
            logger.info(f"Added job: {title} at {company}")

        except Exception as e:
            logger.error(f"Unexpected error processing job item: {e}")
            summary["skipped"] += 1

    logger.info(f"Job ingestion task finished. Summary: {summary}")
    return summary