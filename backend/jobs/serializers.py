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