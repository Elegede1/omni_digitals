"""
Script to update Google OAuth credentials in the database.
Run this after updating your .env file with new credentials.
"""
import os
import django

# Setup Django
os.environ['DATABASE_URL'] = '' # Force SQLite by setting to empty string (prevents load_dotenv override)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

def update_google_credentials():
    """Update or create Google SocialApp with credentials from .env"""
    
    # Get credentials from environment
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    if not client_id or not secret:
        print("❌ Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in environment!")
        print("Make sure your .env file has these values set.")
        return
    
    # Check if credentials are still dummy values
    if client_id == 'your-google-client-id-here' or secret == 'your-google-client-secret-here':
        print("❌ Error: You're still using dummy credentials!")
        print("Please update your .env file with actual Google OAuth credentials.")
        print("\nGet them from: https://console.cloud.google.com/apis/credentials")
        return
    
    # Get or create the site
    site, _ = Site.objects.get_or_create(pk=1, defaults={'domain': 'localhost:8000', 'name': 'localhost'})
    
    # Update or create Google SocialApp
    google_app, created = SocialApp.objects.update_or_create(
        provider='google',
        defaults={
            'name': 'Google',
            'client_id': client_id,
            'secret': secret,
        }
    )
    
    # Add site if not already added
    if site not in google_app.sites.all():
        google_app.sites.add(site)
    
    action = "Created" if created else "Updated"
    print(f"✅ {action} Google OAuth credentials successfully!")
    print(f"   Client ID: {client_id[:20]}...")
    print(f"   Secret: {secret[:15]}...")
    print("\n🔄 Please restart your Django server for changes to take effect.")

if __name__ == '__main__':
    update_google_credentials()
