from django.db import models
from django.conf import settings

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    salary = models.IntegerField()
    source = models.CharField(max_length=50)  # api/manual/dataset
    description = models.TextField()
    apply_link = models.URLField(blank=True)
    

    def __str__(self):
        return self.title    

class Application(models.Model):
    STATUS_CHOICES = [
        ('saved', 'Saved'),
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='saved')
    applied_date = models.DateField(null=True, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    applied_via = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user} - {self.job}"