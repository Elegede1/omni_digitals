import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Profile

User = get_user_model()

def create_admin():
    email = "admin@omnidigitals.com"
    password = "OmniPassword123!" # Change this in production!
    
    if not User.objects.filter(email=email).exists():
        print(f"Creating admin user: {email}")
        user = User.objects.create_superuser(email=email, password=password)
        
        # Create profile
        Profile.objects.create(
            user=user,
            business_name="Omni Digitals",
            onboarding_complete=True
        )
        print("Admin user created successfully.")
    else:
        print("Admin user already exists.")

if __name__ == "__main__":
    create_admin()
