import sys
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Profile, User

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a profile for a new user and handle potential errors."""
    if created:
        try:
            Profile.objects.create(user=instance)
            # Optional: print a success message to confirm the signal ran
            print(f"Successfully created profile for user {instance.email}", file=sys.stdout)
        except Exception as e:
            # CRITICAL: Print any error during profile creation to the logs
            print(f"!!! CRITICAL ERROR creating profile for {instance.email}: {e}", file=sys.stderr)
            # This will ensure the error is visible in Render logs even if the process is killed.
            sys.stdout.flush()
            sys.stderr.flush()
