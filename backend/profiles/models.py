from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True
    )

    resume_text = models.TextField(blank=True)

    uploaded_at = models.DateTimeField(
        auto_now=True
    )
    
    extracted_data = models.JSONField(
        default=dict,
        blank=True
    )

    def __str__(self):
        return self.user.username