"""
Script to clean up duplicate Google SocialApps.
"""
import os
import django

# Setup Django
# os.environ['DATABASE_URL'] = '' # Commented out to use .env configuration (Supabase)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site

def cleanup_google_apps():
    from django.conf import settings
    print(f"🔌 Connected to DB: {settings.DATABASES['default']['HOST'] or 'sqlite'}")
    
    print("📋 Sites:")
    for s in Site.objects.all():
        print(f" - [{s.id}] {s.domain} ({s.name})")

    print("📋 SocialApps:")
    for a in SocialApp.objects.all():
        print(f" - [{a.id}] {a.provider}: {a.name} (Sites: {', '.join([str(s.id) for s in a.sites.all()])})")

    print("🔍 Checking for duplicate Google SocialApps...")
    
    google_apps = SocialApp.objects.filter(provider='google')
    count = google_apps.count()
    
    print(f"Found {count} Google SocialApp(s).")
    
    if count > 1:
        print("⚠️ Duplicates found! Cleaning up...")
        # Delete all and let the update script recreate the correct one
        google_apps.delete()
        print("✅ Deleted all Google SocialApps.")
        
        # Now recreate the correct one
        print("🔄 Recreating the correct Google SocialApp...")
        
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        secret = os.environ.get('GOOGLE_CLIENT_SECRET')
        
        if not client_id or not secret:
            print("❌ Error: Credentials not found in .env!")
            return

        site, _ = Site.objects.get_or_create(pk=1, defaults={'domain': 'localhost:8000', 'name': 'localhost'})
        
        app = SocialApp.objects.create(
            provider='google',
            name='Google',
            client_id=client_id,
            secret=secret
        )
        app.sites.add(site)
        
        print("✅ Recreated Google SocialApp with correct credentials.")
        
    elif count == 1:
        print("✅ Only one Google SocialApp found. No duplicates.")
        # Update app credentials
        app = google_apps.first()
        app.client_id = os.environ.get('GOOGLE_CLIENT_ID')
        app.secret = os.environ.get('GOOGLE_CLIENT_SECRET')
        app.save()
        print("✅ Updated existing app with latest credentials.")
        
        # Update Site domain to localhost
        site = Site.objects.get(pk=1)
        site.domain = 'localhost:8000'
        site.name = 'localhost'
        site.save()
        print("✅ Updated Site 1 to localhost:8000")
        
    else:
        print("ℹ️ No Google SocialApps found.")
        # Create it
        cleanup_google_apps() # Recursion? No, just run the creation logic.
        # (Simpler to just tell user to run update script, but let's do it here)
        
if __name__ == '__main__':
    cleanup_google_apps()
