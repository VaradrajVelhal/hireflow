from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Application, Job
from .serializers import ApplicationSerializer, JobSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from .utils import calculate_match_score
from datetime import timedelta


class JobListView(APIView):
    def get(self, request):
        jobs = Job.objects.all()

        location = request.GET.get('location')
        keyword = request.GET.get('keyword')

        if location:
            jobs = jobs.filter(location__icontains=location)

        if keyword:
            jobs = jobs.filter(title__icontains=keyword)

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class ApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)

        if serializer.is_valid():
            application = serializer.save(user=request.user)

            if not application.applied_via:
                application.applied_via = request.data.get("applied_via", "Website")

            # AUTO FOLLOW-UP (3 days later)
            if not application.follow_up_date:
                application.follow_up_date = now().date() + timedelta(days=3)

            application.save()

            return Response(ApplicationSerializer(application).data)

        return Response(serializer.errors, status=400)


class ApplicationUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        application = get_object_or_404(Application, pk=pk, user=request.user)

        serializer = ApplicationSerializer(application, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


class ApplicationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        application = get_object_or_404(Application, pk=pk, user=request.user)
        application.delete()
        return Response({"message": "Deleted successfully"})


class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(user=request.user).order_by('-id')
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        applications = Application.objects.filter(user=user)

        total = applications.count()
        applied = applications.filter(status='applied').count()
        interview = applications.filter(status='interview').count()
        rejected = applications.filter(status='rejected').count()

        today = now().date()
        upcoming = applications.filter(follow_up_date__gte=today).count()

        return Response({
            "total": total,
            "applied": applied,
            "interview": interview,
            "rejected": rejected,
            "upcoming_followups": upcoming
        })


class MatchScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        skills = request.data.get("skills")

        if not job_id or not skills:
            return Response({"error": "Missing data"}, status=400)

        job = get_object_or_404(Job, id=job_id)

        score = calculate_match_score(job.description, skills)

        return Response({
            "job": job.title,
            "match_score": score
        })
    
from datetime import date

class DueTodayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()

        apps = Application.objects.filter(
            user=request.user,
            follow_up_date=today
        )

        serializer = ApplicationSerializer(apps, many=True)

        return Response({
            "count": apps.count(),
            "applications": serializer.data
        })