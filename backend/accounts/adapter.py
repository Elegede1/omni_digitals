from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from urllib.parse import urlencode

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    
    def get_login_redirect_url(self, request):
        """
        Override to redirect users to the frontend profile page after login.
        Include authentication token in the URL so frontend can authenticate.
        """
        user = request.user
        
        # Generate or get existing token for the user
        token, _ = Token.objects.get_or_create(user=user)
        
        # Get user profile information
        avatar_url = ""
        if hasattr(user, 'profile') and user.profile.profile_picture:
            avatar_url = request.build_absolute_uri(user.profile.profile_picture.url)
        
        # Build query parameters
        params = {
            'token': token.key,
            'email': user.email,
            'avatar': avatar_url,
        }
        
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:8081')
        redirect_url = f"{frontend_url}/profile?{urlencode(params)}"
        
        return redirect_url
    
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates with a
        social provider, but before the login is actually processed.
        """
        email = sociallogin.user.email
        User = get_user_model()

        # Check if a user with this email already exists in our database.
        if User.objects.filter(email=email).exists():
            # User exists, so we can let the login proceed.
            return
        else:
            # User does not exist. We prevent the login and redirect to signup.
            # Get the frontend URL from settings, defaulting to a safe value.
            frontend_signup_url = getattr(settings, 'FRONTEND_SIGNUP_URL', '/signup')
            
            # Add a query parameter to inform the frontend why the redirect happened.
            redirect_url = f"{frontend_signup_url}?error=not_registered&email={email}"
            
            # Use ImmediateHttpResponse to stop the allauth flow and redirect.
            raise ImmediateHttpResponse(redirect(redirect_url))
