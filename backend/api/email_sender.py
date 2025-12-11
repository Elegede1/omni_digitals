"""
Email utility for sending quotation notifications
Sends quotation PDFs to admin via email
"""
from django.core.mail import EmailMessage
from django.conf import settings
import os

def send_quotation_to_admin(quotation, pdf_path):
    """
    Send quotation PDF to admin via email
    
    Args:
        quotation: Quotation model instance
        pdf_path: Path to generated PDF file
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Admin email - can be configured in settings
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@omnidigitals.com')
        
        # Email subject
        subject = f"New Quotation Request - {quotation.quotation_id}"
        
        # Email body
        body = f"""
New Quotation Request Received

Quotation ID: {quotation.quotation_id}
Client: {quotation.user.email}
Submitted: {quotation.created_at.strftime('%B %d, %Y at %I:%M %p')}
Status: {quotation.status}

Selected Services: {len(quotation.selected_services)} service(s)
Price Estimate: ₦{quotation.price_estimate_min_naira:,} - ₦{quotation.price_estimate_max_naira:,}
                ${quotation.price_estimate_min_dollar:,} - ${quotation.price_estimate_max_dollar:,}

Duration: {quotation.duration or 'Not specified'}
Preferred Contact: {quotation.contact_method or 'Not specified'}

Please find the complete quotation details in the attached PDF.

---
Omni Digitals
Quotation Management System
        """.strip()
        
        # Create email
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
            reply_to=[quotation.user.email],
        )
        
        # Attach PDF
        if os.path.exists(pdf_path):
            with open(pdf_path, 'rb') as pdf_file:
                email.attach(
                    f"quotation_{quotation.quotation_id}.pdf",
                    pdf_file.read(),
                    'application/pdf'
                )
        
        # Send email
        email.send(fail_silently=False)
        return True
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
