from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from accounts.models import User, Profile

# /api/health/
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({"status": "ok", "message": "Application is healthy."})

# /api/signup/
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password, first_name=first_name, last_name=last_name)
        
        # Get or create profile (should be created by signal, but let's be safe)
        profile, _ = Profile.objects.get_or_create(user=user)
        
        # Handle profile picture upload if provided
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
        
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# /api/signin/
@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)

        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            # Use get_or_create to make this resilient to users without profiles
            profile, created = Profile.objects.get_or_create(user=user)
            
            avatar_url = None
            if profile.profile_picture:
                avatar_url = request.build_absolute_uri(profile.profile_picture.url)

            return Response({
                "token": token.key,
                "avatar_url": avatar_url,
                "email": user.email
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# /api/dashboard/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    user = request.user
    data = {
        "welcome_message": f"Welcome back, {user.first_name or user.email}!",
        "projects_count": 5, 
        "tasks_pending": 3,
    }
    return Response(data)

# --- Other views ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def membership_billing(request):
    return Response({"message": "membership_billing endpoint"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'POST':
        # Handle profile picture upload
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
        
        # Update user's first and last name if provided
        if 'fullName' in request.data:
            full_name = request.data['fullName']
            if full_name:
                parts = full_name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
                user.save()
        
        # Update profile fields - map frontend field names to backend
        # Note: Profile model might not have all these fields yet
        # You may need to add them to the Profile model
        field_mapping = {
            'phone': 'phone',
            'whatsapp': 'whatsapp', 
            'telegram': 'telegram',
            'businessName': 'business_name',
            'city': 'city',
            'state': 'state',
        }
        
        for frontend_field, backend_field in field_mapping.items():
            if frontend_field in request.data and hasattr(profile, backend_field):
                setattr(profile, backend_field, request.data[frontend_field])
        
        # Save the profile
        profile.save()
        
        # Return updated avatar URL
        avatar_url = ''
        if profile.profile_picture:
            avatar_url = request.build_absolute_uri(profile.profile_picture.url)
        
        return Response({
            "message": "Profile updated successfully",
            "avatar_url": avatar_url
        })
    
    # Calculate user statistics
    # TODO: Replace with actual order/quotation count from database
    total_orders = 0  # Will increase as user completes requests
    membership_level = "Free"  # Default membership level
    member_id = f"USER-{user.id:04d}"  # Format: USER-0001, USER-0002, etc.
    
    # Get avatar URL from profile picture
    avatar_url = ''
    if profile.profile_picture:
        avatar_url = request.build_absolute_uri(profile.profile_picture.url)
    
    profile_data = {
        "email": user.email,
        "fullName": user.get_full_name(),
        "avatar_url": avatar_url,
        "phone": profile.phone or "",
        "whatsapp": profile.whatsapp or "",
        "telegram": profile.telegram or "",
        "businessName": profile.business_name or "",
        "city": profile.city or "",
        "state": profile.state or "",
    }
    
    statistics = {
        "totalOrders": total_orders,
        "membershipLevel": membership_level,
        "memberId": member_id,
    }
    
    return Response({
        "profile": profile_data,
        "statistics": statistics
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quotation(request):
    return Response({"message": "quotation endpoint"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_quotation(request):
    return Response({"message": "request_quotation endpoint"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    return Response({"message": "chat endpoint"})

@api_view(['GET'])
@permission_classes([AllowAny])
def community(request):
    return Response({"message": "community endpoint"})
