from rest_framework import serializers
from .models import Profile


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["resume"]
    def validate_resume(self, value):
        
        if not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF resumes are supported.")
        return value

class MatchJobSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()