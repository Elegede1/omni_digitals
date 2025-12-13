from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from accounts.models import User, Profile, Quotation, Report
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
        
        # Create welcome notification for new user
        from accounts.models import Notification
        Notification.objects.create(
            user=user,
            message="Welcome to Omni Digitals! We are excited to work with you.",
            notification_type='welcome',
            related_url='/dashboard'
        )
        
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
                "email": user.email,
                "user_id": user.id
            })
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    try:
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        avatar_url = None
        if profile.profile_picture:
            avatar_url = request.build_absolute_uri(profile.profile_picture.url)
            
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "avatar_url": avatar_url,
            "is_admin": user.is_superuser
        })
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    try:
        report_type = request.data.get('report_type')
        description = request.data.get('description')

        if not report_type or not description:
            return Response({"error": "Report type and description are required"}, status=status.HTTP_400_BAD_REQUEST)

        report = Report.objects.create(
            reporter=request.user,
            report_type=report_type,
            description=description
        )

        # Notify Admins
        from django.contrib.auth import get_user_model
        from accounts.models import Notification
        User = get_user_model()
        admins = User.objects.filter(is_superuser=True)
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"New Report: {report_type} by {request.user.email}",
                notification_type='admin_message',
                related_url='/admin/reports'
            )

        return Response({"message": "Report submitted successfully", "report_id": report.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_reports(request):
    reports = Report.objects.all()
    report_data = []
    for report in reports:
        report_data.append({
            "id": report.id,
            "reporter": report.reporter.email,
            "report_type": report.report_type,
            "description": report.description,
            "status": report.status,
            "created_at": report.created_at,
        })
    return Response(report_data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_report_status(request, report_id):
    try:
        report = Report.objects.get(id=report_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response({"error": "Status not provided"}, status=status.HTTP_400_BAD_REQUEST)

        report.status = new_status
        report.save()
        return Response({"message": f"Report status updated to {new_status}"})
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ============================================
# Community Posts API
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def community_posts(request):
    """
    GET: List all community posts
    POST: Create a new community post
    """
    from accounts.models import CommunityPost, Notification
    
    if request.method == 'GET':
        from accounts.models import PostLike
        
        # Support sorting by likes for search ranking
        sort_by = request.query_params.get('sort', 'recent')
        if sort_by == 'likes':
            posts = CommunityPost.objects.all().order_by('-likes', '-created_at')
        else:
            posts = CommunityPost.objects.all().order_by('-created_at')
        
        posts_data = []
        for post in posts:
            # Check if current user has liked this post
            user_has_liked = False
            if request.user.is_authenticated:
                user_has_liked = PostLike.objects.filter(post=post, user=request.user).exists()
            
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author_name,
                'avatar': request.build_absolute_uri(post.author_avatar) if post.author_avatar else None,
                'tags': post.tags,
                'likes': post.likes,
                'user_has_liked': user_has_liked,
                'comments_count': post.comments.count(),
                'created_at': post.created_at,
                'is_registered_user': post.user is not None,
                'is_admin_author': post.user.is_superuser if post.user else False,
                'user_id': post.user.id if post.user else None,
                'guest_email': post.guest_email if not post.user else None,
            })
        return Response({'posts': posts_data})
    
    elif request.method == 'POST':
        title = request.data.get('title')
        content = request.data.get('content')
        tags = request.data.get('tags', [])
        guest_name = request.data.get('guest_name', '')
        guest_email = request.data.get('guest_email', '')
        
        if not title or not content:
            return Response({'error': 'Title and content are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check @admin tag - only allowed for registered users
        if '@admin' in content and not request.user.is_authenticated:
            return Response({'error': '@admin mentions are only available for registered users'}, status=status.HTTP_403_FORBIDDEN)
        
        # For non-authenticated users, require name and email
        if not request.user.is_authenticated:
            if not guest_name or not guest_email:
                return Response({'error': 'Name and email are required for guest posts'}, status=status.HTTP_400_BAD_REQUEST)
        
        post = CommunityPost.objects.create(
            user=request.user if request.user.is_authenticated else None,
            guest_name=guest_name if not request.user.is_authenticated else '',
            guest_email=guest_email if not request.user.is_authenticated else '',
            title=title,
            content=content,
            tags=tags
        )
        
        # If @admin is mentioned, notify admin
        if '@admin' in content:
            admin_users = User.objects.filter(is_superuser=True)
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
                    message=f'You were mentioned in a post: {title[:50]}',
                    notification_type='post_mention',
                    related_post=post,
                    related_url=f'/community?post={post.id}'
                )
        
        return Response({
            'message': 'Post created successfully',
            'post_id': post.id
        }, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def community_post_detail(request, post_id):
    """
    PUT: Update a community post (only by creator)
    DELETE: Delete a community post (only by creator or admin)
    """
    from accounts.models import CommunityPost
    
    try:
        post = CommunityPost.objects.get(id=post_id)
    except CommunityPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    is_owner = False
    if request.user.is_authenticated and post.user == request.user:
        is_owner = True
    elif not request.user.is_authenticated:
        # For guests, check email match
        provided_email = request.data.get('guest_email', '')
        if provided_email and provided_email == post.guest_email:
            is_owner = True
    
    # Admin can always delete
    is_admin = request.user.is_authenticated and request.user.is_superuser
    
    if request.method == 'PUT':
        if not is_owner:
            return Response({'error': 'You can only edit your own posts'}, status=status.HTTP_403_FORBIDDEN)
        
        post.title = request.data.get('title', post.title)
        post.content = request.data.get('content', post.content)
        post.tags = request.data.get('tags', post.tags)
        post.save()
        
        return Response({'message': 'Post updated successfully'})
    
    elif request.method == 'DELETE':
        if not is_owner and not is_admin:
            return Response({'error': 'You can only delete your own posts'}, status=status.HTTP_403_FORBIDDEN)
        
        post.delete()
        return Response({'message': 'Post deleted successfully'})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def post_comments(request, post_id):
    """
    GET: List comments for a post
    POST: Create a comment on a post
    """
    from accounts.models import CommunityPost, Comment, Notification
    
    try:
        post = CommunityPost.objects.get(id=post_id)
    except CommunityPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        from accounts.models import Profile, CommentLike
        comments = post.comments.all()
        comments_data = []
        for comment in comments:
            avatar_url = None
            user_id = None
            if comment.user:
                user_id = comment.user.id
                try:
                    profile = Profile.objects.get(user=comment.user)
                    if profile.profile_picture:
                        avatar_url = request.build_absolute_uri(profile.profile_picture.url)
                except Profile.DoesNotExist:
                    pass
            
            # Check if current user has liked this comment
            user_has_liked = False
            if request.user.is_authenticated:
                user_has_liked = CommentLike.objects.filter(comment=comment, user=request.user).exists()
            
            comments_data.append({
                'id': comment.id,
                'content': comment.content,
                'author': comment.author_name,
                'avatar': avatar_url,
                'user_id': user_id,
                'guest_email': comment.guest_email if not comment.user else None,
                'likes': comment.likes,
                'user_has_liked': user_has_liked,
                'created_at': comment.created_at,
                'is_registered_user': comment.user is not None,
                'is_admin_author': comment.user.is_superuser if comment.user else False,
            })
        return Response({'comments': comments_data})
    
    elif request.method == 'POST':
        content = request.data.get('content')
        guest_name = request.data.get('guest_name', '')
        guest_email = request.data.get('guest_email', '')
        
        if not content:
            return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # For non-authenticated users, require name and email
        if not request.user.is_authenticated:
            if not guest_name or not guest_email:
                return Response({'error': 'Name and email are required for guest comments'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = Comment.objects.create(
            post=post,
            user=request.user if request.user.is_authenticated else None,
            guest_name=guest_name if not request.user.is_authenticated else '',
            guest_email=guest_email if not request.user.is_authenticated else '',
            content=content
        )
        
        # Notify post author if they are a registered user
        if post.user:
            commenter_name = request.user.get_full_name() or request.user.email if request.user.is_authenticated else guest_name
            Notification.objects.create(
                user=post.user,
                message=f'{commenter_name} commented on your post: {post.title[:30]}',
                notification_type='comment_reply',
                related_post=post,
                related_url=f'/community?post={post.id}'
            )
        
        return Response({
            'message': 'Comment added successfully',
            'comment_id': comment.id
        }, status=status.HTTP_201_CREATED)


# ============================================
# Notifications API
# ============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get all notifications for the authenticated user."""
    from accounts.models import Notification
    
    notifications = Notification.objects.filter(user=request.user)
    notifications_data = []
    unread_count = 0
    
    for notif in notifications:
        if not notif.is_read:
            unread_count += 1
        notifications_data.append({
            'id': notif.id,
            'message': notif.message,
            'type': notif.notification_type,
            'is_read': notif.is_read,
            'related_url': notif.related_url,
            'related_post_id': notif.related_post.id if notif.related_post else None,
            'created_at': notif.created_at,
        })
    
    return Response({
        'notifications': notifications_data,
        'unread_count': unread_count
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a notification as read."""
    from accounts.models import Notification
    
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the user."""
    from accounts.models import Notification
    
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'All notifications marked as read'})

@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def comment_detail(request, comment_id):
    """
    PUT: Update a comment (only by creator)
    DELETE: Delete a comment (only by creator or admin)
    """
    from accounts.models import Comment
    
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check ownership
    is_owner = False
    if request.user.is_authenticated and comment.user == request.user:
        is_owner = True
    elif not request.user.is_authenticated:
        provided_email = request.data.get('guest_email', '')
        if provided_email and provided_email == comment.guest_email:
            is_owner = True
    
    is_admin = request.user.is_authenticated and request.user.is_superuser
    
    if request.method == 'PUT':
        if not is_owner:
            return Response({'error': 'You can only edit your own comments'}, status=status.HTTP_403_FORBIDDEN)
        
        comment.content = request.data.get('content', comment.content)
        comment.save()
        return Response({'message': 'Comment updated successfully'})
    
    elif request.method == 'DELETE':
        if not is_owner and not is_admin:
            return Response({'error': 'You can only delete your own comments'}, status=status.HTTP_403_FORBIDDEN)
        
        post_id = comment.post.id
        comment.delete()
        return Response({'message': 'Comment deleted successfully', 'post_id': post_id})

# ============================================
# Like/Unlike API
# ============================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_post_like(request, post_id):
    """Toggle like on a post. Returns new like count and status."""
    from accounts.models import CommunityPost, PostLike
    
    try:
        post = CommunityPost.objects.get(id=post_id)
    except CommunityPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user already liked
    existing_like = PostLike.objects.filter(post=post, user=request.user).first()
    
    if existing_like:
        # Unlike
        existing_like.delete()
        post.likes = max(0, post.likes - 1)
        post.save()
        return Response({'liked': False, 'likes': post.likes})
    else:
        # Like
        PostLike.objects.create(post=post, user=request.user)
        post.likes += 1
        post.save()
        return Response({'liked': True, 'likes': post.likes})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_comment_like(request, comment_id):
    """Toggle like on a comment. Returns new like count and status."""
    from accounts.models import Comment, CommentLike
    
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user already liked
    existing_like = CommentLike.objects.filter(comment=comment, user=request.user).first()
    
    if existing_like:
        # Unlike
        existing_like.delete()
        comment.likes = max(0, comment.likes - 1)
        comment.save()
        return Response({'liked': False, 'likes': comment.likes})
    else:
        # Like
        CommentLike.objects.create(comment=comment, user=request.user)
        comment.likes += 1
        comment.save()
        return Response({'liked': True, 'likes': comment.likes})
