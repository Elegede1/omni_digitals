from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# /api/health/
def health_check(request):
    return JsonResponse({"status": "ok", "message": "Application is healthy."})

# /api/dashboard/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """Provides data for the main dashboard. Requires user to be logged in."""
    user = request.user
    # In the future, you would fetch real data from your database here.
    data = {
        "welcome_message": f"Welcome back, {user.first_name or user.email}!",
        "projects_count": 5, # Example data
        "tasks_pending": 3,    # Example data
    }
    return JsonResponse(data)

# --- Placeholder views for other features ---

@api_view(['GET'])
def membership_billing(request):
    return JsonResponse({"message": "membership_billing endpoint"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    profile_data = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        # Add other profile fields here from the Profile model
    }
    return JsonResponse(profile_data)

@api_view(['GET'])
def quotation(request):
    return JsonResponse({"message": "quotation endpoint"})

@api_view(['POST'])
def request_quotation(request):
    return JsonResponse({"message": "request_quotation endpoint"})

@api_view(['POST'])
def signin(request):
    return JsonResponse({"message": "signin endpoint"})

@api_view(['POST'])
def signup(request):
    return JsonResponse({"message": "signup endpoint"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    return JsonResponse({"message": "chat endpoint"})

@api_view(['GET'])
def community(request):
    return JsonResponse({"message": "community endpoint"})
