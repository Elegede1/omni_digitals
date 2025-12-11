from django.conf import settings
import os
from datetime import datetime

def generate_quotation_pdf(quotation):
    """
    Generate a PDF for a quotation request
    
    Args:
        quotation: Quotation model instance
        
    Returns:
        str: Path to generated PDF file
    """
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    except ImportError:
        # Fallback or re-raise with clear message
        raise ImportError("ReportLab is not installed. Please run 'pip install reportlab'.")
    # Create media/quotations directory if it doesn't exist
    pdf_dir = os.path.join(settings.MEDIA_ROOT, 'quotations')
    os.makedirs(pdf_dir, exist_ok=True)
    
    # Generate PDF filename
    pdf_filename = f"quotation_{quotation.quotation_id}.pdf"
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#10b981'),  # Primary green color
        spaceAfter=30,
        alignment=TA_CENTER,
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#10b981'),
        spaceAfter=12,
    )
    normal_style = styles['Normal']
    
    # Title
    title = Paragraph("Quotation Request", title_style)
    story.append(title)
    story.append(Spacer(1, 0.3*inch))
    
    # Quotation Info
    info_data = [
        ['Quotation ID:', quotation.quotation_id],
        ['Date:', quotation.created_at.strftime('%B %d, %Y %I:%M %p')],
        ['Client:', quotation.user.email],
        ['Status:', quotation.status],
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4.5*inch])
    info_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONT', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#6b7280')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Selected Services
    story.append(Paragraph("Selected Services", heading_style))
    
    # Services table
    services_data = [['#', 'Service Name', 'Price Range (₦)', 'Price Range ($)']]
    
    for idx, service in enumerate(quotation.selected_services, 1):
        service_name = service.get('name', 'N/A')
        price_naira = f"₦{service.get('priceNaira', {}).get('min', 0):,} - ₦{service.get('priceNaira', {}).get('max', 0):,}"
        price_dollar = f"${service.get('priceDollar', {}).get('min', 0):,} - ${service.get('priceDollar', {}).get('max', 0):,}"
        
        services_data.append([
            str(idx),
            service_name,
            price_naira,
            price_dollar
        ])
    
    services_table = Table(services_data, colWidths=[0.5*inch, 3*inch, 1.5*inch, 1.5*inch])
    services_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('FONT', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ALIGN', (0, 1), (0, -1), 'CENTER'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#10b981')),
        
        # Alternating row colors
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
    ]))
    story.append(services_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Price Estimate
    story.append(Paragraph("Total Price Estimate", heading_style))
    
    price_data = [
        ['Currency', 'Minimum', 'Maximum'],
        ['Naira (₦)', f"₦{quotation.price_estimate_min_naira:,}", f"₦{quotation.price_estimate_max_naira:,}"],
        ['Dollar ($)', f"${quotation.price_estimate_min_dollar:,}", f"${quotation.price_estimate_max_dollar:,}"],
    ]
    
    price_table = Table(price_data, colWidths=[2*inch, 2*inch, 2*inch])
    price_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONT', (0, 1), (-1, -1), 'Helvetica'),
        ('FONT', (1, 1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#10b981')),
    ]))
    story.append(price_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Additional Details
    story.append(Paragraph("Additional Details", heading_style))
    
    details_data = [
        ['Duration:', quotation.duration or 'Not specified'],
        ['Preferred Contact:', quotation.contact_method or 'Not specified'],
    ]
    
    details_table = Table(details_data, colWidths=[2*inch, 4.5*inch])
    details_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONT', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(details_table)
    
    # Additional Information
    if quotation.additional_info:
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph("<b>Additional Information:</b>", normal_style))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(quotation.additional_info, normal_style))
    
    # Build PDF
    doc.build(story)
    
    return pdf_path
