from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import get_user_model

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
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
