from django.core.management.base import BaseCommand
from accounts.models import Quotation, Message, User, Notification, Profile
from django.db.models import Q

class Command(BaseCommand):
    help = 'Syncs existing quotations to Admin Messages and Notifications'

    def handle(self, *args, **options):
        self.stdout.write("Starting Quotation Sync...")
        
        # 1. Find an Admin to receive messages
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR("No Admin user found! Please create a superuser."))
            return

        self.stdout.write(f"Syncing messages to Admin: {admin_user.email}")

        # 2. Get all non-draft quotations
        quotations = Quotation.objects.exclude(status='Draft')
        count = 0

        for q in quotations:
            # Check if message already exists for this quotation
            # We look for a message from this user to admin containing the quotation ID
            exists = Message.objects.filter(
                sender=q.user, 
                recipient=admin_user, 
                content__contains=f"({q.quotation_id})"
            ).exists()

            if not exists:
                self.stdout.write(f"Creating message for Quotation {q.quotation_id}...")
                
                # Handle selected_services being list of strings or list of dicts
                services_text = ""
                if q.selected_services:
                    if isinstance(q.selected_services[0], dict):
                        services_text = ', '.join([s.get('name', 'Service') for s in q.selected_services])
                    else:
                        services_text = ', '.join(q.selected_services)

                msg_content = f"New Quotation Request ({q.quotation_id})\n" \
                              f"Services: {services_text}\n" \
                              f"Budget: {q.price_estimate_min_naira} - {q.price_estimate_max_naira} NGN\n" \
                              f"Duration: {q.duration}\n" \
                              f"Auto-generated from submission (Sync)."
                
                # Create Message
                Message.objects.create(
                    sender=q.user,
                    recipient=admin_user,
                    content=msg_content,
                    is_read=False # Admin hasn't read it yet
                )
                
                # Create Notification
                Notification.objects.create(
                    user=admin_user,
                    message=f"New Quotation Request from {q.user.email} ({q.quotation_id})",
                    notification_type='admin_message',
                    related_url='/dashboard'
                )
                
                count += 1
            else:
                self.stdout.write(f"Skipping {q.quotation_id}, message exists.")

        self.stdout.write(self.style.SUCCESS(f"Sync Complete. Created {count} messages/notifications."))
