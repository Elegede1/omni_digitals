from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"message": "Backend is running!"})

def membership_billing(request):
    return JsonResponse({"message": "Membership billing page"})

def profile(request):
    return JsonResponse({"message": "Profile page"})

def quotation(request):
    return JsonResponse({"message": "Quotation page"})

def request_quotation(request):
    return JsonResponse({"message": "Request quotation page"})

def signin(request):
    return JsonResponse({"message": "Signin page"})

def signup(request):
    return JsonResponse({"message": "Signup page"})

def chat(request):
    return JsonResponse({"message": "Chat page"})

def community(request):
    return JsonResponse({"message": "Community page"})

def dashboard(request):
    return JsonResponse({"message": "Dashboard page"})
