from datetime import date
from django.core.mail import send_mail

from backend.hireflow import settings
from backend.hireflow.settings import EMAIL_HOST_USER
from .models import Application
import requests
from .models import Job

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
    print("Fetching jobs...")

    url = "https://remotive.com/api/remote-jobs"
    response = requests.get(url)

    print("Status:", response.status_code)

    data = response.json()
    print("Total jobs from API:", len(data["jobs"]))

    for item in data["jobs"][:5]:
        print("Processing:", item["title"])

        title = item["title"]
        company = item["company_name"]

        if Job.objects.filter(title=title, company=company).exists():
            print("Duplicate skipped")
            continue

        Job.objects.create(
            title=title,
            company=company,
            location=item["candidate_required_location"],
            salary=0,
            source="api",
            description=item["description"],
            apply_link=item.get("url", "")
        )

        print("Added:", title)

