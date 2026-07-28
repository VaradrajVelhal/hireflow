from rest_framework import serializers
from .models import Job,Application

class JobSerializer(serializers.ModelSerializer):
    is_applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'

    def get_is_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(user=request.user, job=obj).exists()
        return False

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['user']

    def validate(self, data):
        applied_date = data.get('applied_date')
        follow_up_date = data.get('follow_up_date')

        if applied_date and follow_up_date:
            if follow_up_date < applied_date:
                raise serializers.ValidationError({
                    "follow_up_date": "Follow-up date cannot be before the applied date."
                })

        return data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['job'] = JobSerializer(instance.job, context=self.context).data
        return representation


from django.db import transaction
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError

class ManualApplicationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=True, allow_blank=False, trim_whitespace=True)
    company = serializers.CharField(max_length=255, required=True, allow_blank=False, trim_whitespace=True)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True, trim_whitespace=True, default="")
    apply_link = serializers.CharField(max_length=500, required=False, allow_blank=True, trim_whitespace=True, default="")
    status = serializers.ChoiceField(choices=Application.STATUS_CHOICES, default='saved')
    applied_date = serializers.DateField(required=False, allow_null=True)
    follow_up_date = serializers.DateField(required=False, allow_null=True)
    applied_via = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_apply_link(self, value):
        if value:
            validator = URLValidator()
            try:
                validator(value)
            except ValidationError:
                raise serializers.ValidationError("Enter a valid URL.")
        return value

    def validate(self, data):
        status = data.get('status')
        applied_date = data.get('applied_date')
        follow_up_date = data.get('follow_up_date')

        # If status is "applied", "interview", or "rejected": applied_date should be required
        if status in ['applied', 'interview', 'rejected']:
            if not applied_date:
                raise serializers.ValidationError({
                    "applied_date": "Applied date is required for this status."
                })
        
        if applied_date and follow_up_date:
            if follow_up_date < applied_date:
                raise serializers.ValidationError({
                    "follow_up_date": "Follow-up date cannot be before the applied date."
                })

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        
        title = validated_data.pop('title')
        company = validated_data.pop('company')
        location = validated_data.pop('location', "")
        apply_link = validated_data.pop('apply_link', "")
        
        with transaction.atomic():
            job = Job.objects.create(
                title=title,
                company=company,
                location=location,
                salary=None,
                source="manual",
                description="",
                apply_link=apply_link
            )
            
            application = Application.objects.create(
                user=user,
                job=job,
                **validated_data
            )
            
            if not application.follow_up_date and application.status in ['applied', 'interview']:
                from django.utils.timezone import now
                from datetime import timedelta

                ref_date = application.applied_date or now().date()
                application.follow_up_date = ref_date + timedelta(days=3)
                application.save()
                
            return application