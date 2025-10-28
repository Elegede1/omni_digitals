from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

def membership_billing(request):
    return JsonResponse({"message": "membership_billing endpoint"})

def profile(request):
    return JsonResponse({"message": "profile endpoint"})

def quotation(request):
    return JsonResponse({"message": "quotation endpoint"})

def request_quotation(request):
    return JsonResponse({"message": "request_quotation endpoint"})

def signin(request):
    return JsonResponse({"message": "signin endpoint"})

def signup(request):
    return JsonResponse({"message": "signup endpoint"})

def chat(request):
    return JsonResponse({"message": "chat endpoint"})

def community(request):
    return JsonResponse({"message": "community endpoint"})

def dashboard(request):
    return JsonResponse({"message": "dashboard endpoint"})
