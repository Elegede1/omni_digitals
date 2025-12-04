import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
os.environ['DATABASE_URL'] = ''  # Force SQLite
django.setup()

from accounts.models import User, Profile

print("\n=== User and Profile Information ===\n")
print(f"Total Users: {User.objects.count()}")
print(f"Total Profiles: {Profile.objects.count()}\n")

for user in User.objects.all():
    has_profile = hasattr(user, 'profile')
    has_pic = bool(user.profile.profile_picture) if has_profile else False
    pic_path = user.profile.profile_picture.name if has_pic else "None"
    
    print(f"Email: {user.email}")
    print(f"  - ID: {user.id}")
    print(f"  - Name: {user.get_full_name()}")
    print(f"  - Has Profile: {has_profile}")
    print(f"  - Has Picture: {has_pic}")
    print(f"  - Picture Path: {pic_path}")
    print()

print("\n=== Actions ===")
print("To delete a user, run:")
print("  python manage_users.py delete <email>")
print("\nTo delete all users, run:")
print("  python manage_users.py delete-all")
print()

if len(sys.argv) > 1:
    action = sys.argv[1]
    
    if action == "delete" and len(sys.argv) > 2:
        email = sys.argv[2]
        try:
            user = User.objects.get(email=email)
            user.delete()
            print(f"✓ Deleted user: {email}")
        except User.DoesNotExist:
            print(f"✗ User not found: {email}")
    
    elif action == "delete-all":
        confirm = input("Are you sure you want to delete ALL users? (yes/no): ")
        if confirm.lower() == "yes":
            count = User.objects.count()
            User.objects.all().delete()
            print(f"✓ Deleted {count} users")
        else:
            print("✗ Cancelled")
