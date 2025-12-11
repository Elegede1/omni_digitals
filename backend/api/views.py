from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from accounts.models import User, Profile, Quotation
from .pdf_generator import generate_quotation_pdf
from .email_sender import send_quotation_to_admin

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

# Quotation Endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quotation(request):
    """
    Submit a new quotation request
    Creates quotation, generates PDF, and sends email to admin
    """
    try:
        from accounts.models import Quotation
        from .pdf_generator import generate_quotation_pdf
        from .email_sender import send_quotation_to_admin
        
        # Extract data from request
        selected_services = request.data.get('selected_services', [])
        price_min_naira = request.data.get('price_estimate_min_naira', 0)
        price_max_naira = request.data.get('price_estimate_max_naira', 0)
        price_min_dollar = request.data.get('price_estimate_min_dollar', 0)
        price_max_dollar = request.data.get('price_estimate_max_dollar', 0)
        duration = request.data.get('duration', '')
        additional_info = request.data.get('additional_info', '')
        contact_method = request.data.get('contact_method', '')
        
        # Validation
        if not selected_services:
            return Response(
                {"error": "Please select at least one service"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Status (Draft or Pending)
        status_val = request.data.get('status', 'Pending')
        
        # Create quotation
        quotation = Quotation.objects.create(
            user=request.user,
            selected_services=selected_services,
            price_estimate_min_naira=price_min_naira,
            price_estimate_max_naira=price_max_naira,
            price_estimate_min_dollar=price_min_dollar,
            price_estimate_max_dollar=price_max_dollar,
            duration=duration,
            additional_info=additional_info,
            contact_method=contact_method,
            status=status_val
        )
        
        # Only Generate PDF and Send Email if Pending (active submission)
        if status_val == 'Pending':
            # Generate PDF
            try:
                pdf_path = generate_quotation_pdf(quotation)
            except Exception as e:
                print(f"PDF generation error: {str(e)}")
                # For drafts this is fine, but for final submit we might want to know
                pdf_path = None
            
            # Send email to admin
            if pdf_path:
                try:
                    send_quotation_to_admin(quotation, pdf_path)
                except Exception as e:
                    print(f"Email sending error: {str(e)}")
        
        return Response({
            "message": "Quotation submitted successfully" if status_val == 'Pending' else "Draft saved successfully",
            "quotation_id": quotation.quotation_id,
            "status": quotation.status
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_quotation_detail(request, quotation_id):
    """
    Get or Delete quotation by ID
    """
    from accounts.models import Quotation
    
    try:
        quotation = Quotation.objects.get(quotation_id=quotation_id, user=request.user)
        
        if request.method == 'DELETE':
            quotation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({
            "quotation_id": quotation.quotation_id,
            "selected_services": quotation.selected_services,
            "duration": quotation.duration,
            "additional_info": quotation.additional_info,
            "contact_method": quotation.contact_method,
            "status": quotation.status,
            "created_at": quotation.created_at,
            # include other price fields if needed by frontend, usually calculated
        })
    except Quotation.DoesNotExist:
        return Response({"error": "Quotation not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_quotation(request, quotation_id):
    """
    Update an existing quotation (e.g. Draft -> Pending)
    """
    from accounts.models import Quotation
    from .pdf_generator import generate_quotation_pdf
    from .email_sender import send_quotation_to_admin
    
    try:
        quotation = Quotation.objects.get(quotation_id=quotation_id, user=request.user)
        
        # Update fields
        if 'selected_services' in request.data:
            quotation.selected_services = request.data['selected_services']
        
        # Helper to safely get float/decimal
        quotation.price_estimate_min_naira = request.data.get('price_estimate_min_naira', quotation.price_estimate_min_naira)
        quotation.price_estimate_max_naira = request.data.get('price_estimate_max_naira', quotation.price_estimate_max_naira)
        quotation.price_estimate_min_dollar = request.data.get('price_estimate_min_dollar', quotation.price_estimate_min_dollar)
        quotation.price_estimate_max_dollar = request.data.get('price_estimate_max_dollar', quotation.price_estimate_max_dollar)
        
        quotation.duration = request.data.get('duration', quotation.duration)
        quotation.additional_info = request.data.get('additional_info', quotation.additional_info)
        quotation.contact_method = request.data.get('contact_method', quotation.contact_method)
        
        new_status = request.data.get('status', quotation.status)
        old_status = quotation.status
        quotation.status = new_status
        
        quotation.save()
        
        # If transitioning to Pending (Submitting), generate PDF and Email
        if new_status == 'Pending' and old_status == 'Draft':
             # Generate PDF
            try:
                pdf_path = generate_quotation_pdf(quotation)
                
                # Send email to admin
                if pdf_path:
                    send_quotation_to_admin(quotation, pdf_path)
            except Exception as e:
                print(f"Error during submission processing: {str(e)}")
        
        return Response({
            "message": "Quotation updated successfully",
            "quotation_id": quotation.quotation_id,
            "status": quotation.status
        })

    except Quotation.DoesNotExist:
        return Response({"error": "Quotation not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_all_quotations(request):
    """
    Admin: List all quotations
    """
    from accounts.models import Quotation
    # Order by newest first
    quotations = Quotation.objects.all().order_by('-created_at')
    
    quotations_data = []
    for q in quotations:
        quotations_data.append({
            'quotation_id': q.quotation_id,
            'user_email': q.user.email,
            'user_name': q.user.profile.full_name if hasattr(q.user, 'profile') else "Unknown",
            'selected_services': q.selected_services,
            'price_estimate_min_naira': str(q.price_estimate_min_naira),
            'price_estimate_max_naira': str(q.price_estimate_max_naira),
            'price_estimate_min_dollar': str(q.price_estimate_min_dollar),
            'price_estimate_max_dollar': str(q.price_estimate_max_dollar),
            'duration': q.duration,
            'status': q.status,
            'created_at': q.created_at,
        })
    return Response({"quotations": quotations_data})

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_quotation_status(request, quotation_id):
    """
    Admin: Update quotation status (e.g. Paid, Done)
    """
    from accounts.models import Quotation
    
    try:
        quotation = Quotation.objects.get(quotation_id=quotation_id)
        new_status = request.data.get('status')
        
        if new_status:
            quotation.status = new_status
            quotation.save()
            return Response({"message": f"Status updated to {new_status}"})
        else:
            return Response({"error": "Status not provided"}, status=status.HTTP_400_BAD_REQUEST)
            
    except Quotation.DoesNotExist:
        return Response({"error": "Quotation not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_completed_works(request):
    """
    Public: List completed works (Status='Done')
    """
    from accounts.models import Quotation
    
    works = Quotation.objects.filter(status='Done').order_by('-created_at')
    
    works_data = []
    for w in works:
        works_data.append({
            'quotation_id': w.quotation_id,
            'selected_services': w.selected_services,
            'duration': w.duration,
            'price_estimate_min_naira': str(w.price_estimate_min_naira),
            'price_estimate_max_naira': str(w.price_estimate_max_naira),
            'price_estimate_min_dollar': str(w.price_estimate_min_dollar),
            'price_estimate_max_dollar': str(w.price_estimate_max_dollar),
            # Do NOT expose user info for public works
        })
    return Response({"works": works_data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quotations(request):
    """
    Get user's past quotations
    Returns list of quotations for authenticated user
    """
    try:
        from accounts.models import Quotation
        
        quotations = Quotation.objects.filter(user=request.user).order_by('-created_at')
        
        quotations_data = []
        for q in quotations:
            quotations_data.append({
                'quotation_id': q.quotation_id,
                'selected_services': q.selected_services,
                'price_estimate_min_naira': str(q.price_estimate_min_naira),
                'price_estimate_max_naira': str(q.price_estimate_max_naira),
                'price_estimate_min_dollar': str(q.price_estimate_min_dollar),
                'price_estimate_max_dollar': str(q.price_estimate_max_dollar),
                'duration': q.duration,
                'additional_info': q.additional_info,
                'contact_method': q.contact_method,
                'status': q.status,
                'created_at': q.created_at.isoformat(),
                'updated_at': q.updated_at.isoformat(),
            })
        
        return Response({
            "quotations": quotations_data,
            "count": len(quotations_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": f"Failed to retrieve quotations: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_quotation_pdf(request, quotation_id):
    """
    Download quotation PDF
    """
    try:
        from accounts.models import Quotation
        from django.http import FileResponse, Http404
        from django.conf import settings
        import os
        
        # Get quotation and verify ownership
        try:
            quotation = Quotation.objects.get(quotation_id=quotation_id, user=request.user)
        except Quotation.DoesNotExist:
            raise Http404("Quotation not found")
        
        # Construct PDF path
        pdf_filename = f"quotation_{quotation.quotation_id}.pdf"
        pdf_path = os.path.join(settings.MEDIA_ROOT, 'quotations', pdf_filename)
        
        if os.path.exists(pdf_path):
            return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
        else:
            # Regenerate if missing
            # Regenerate if missing
            from .pdf_generator import generate_quotation_pdf
            # Let exceptions propagate (e.g. ImportError) so user sees the real error
            pdf_path = generate_quotation_pdf(quotation)
            if os.path.exists(pdf_path):
                return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
            
            return Response(
                {"error": "PDF file not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {"error": f"Failed to download PDF: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
