from django.http import JsonResponse

def health_check(request):
    """A simple view to confirm the application is running."""
    return JsonResponse({"status": "ok", "message": "Application is healthy."})
