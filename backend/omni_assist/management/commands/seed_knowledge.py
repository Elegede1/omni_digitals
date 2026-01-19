"""
Django management command to seed the knowledge base with initial content.
"""
from django.core.management.base import BaseCommand
from omni_assist.models import KnowledgeBase, EscalationRule


class Command(BaseCommand):
    help = 'Seed the Omni Assist knowledge base with initial content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing knowledge base entries before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing knowledge base...')
            KnowledgeBase.objects.all().delete()
            EscalationRule.objects.all().delete()

        self.stdout.write('Seeding knowledge base...')
        self.seed_knowledge_base()
        
        self.stdout.write('Seeding escalation rules...')
        self.seed_escalation_rules()
        
        self.stdout.write(self.style.SUCCESS('Knowledge base seeded successfully!'))

    def seed_knowledge_base(self):
        """Seed knowledge base with initial content."""
        entries = [
            # About Omni Digitals
            {
                'category': 'about',
                'title': 'What is Omni Digitals?',
                'content': '''Omni Digitals is a premium digital services company specializing in helping businesses and individuals establish and grow their online presence.

We offer comprehensive digital solutions including social media marketing, graphic design, web development, content creation, and SEO services. Our team of experts works closely with clients to deliver tailored solutions that drive real results.

Founded with the mission to make professional digital services accessible to everyone, Omni Digitals has helped hundreds of clients achieve their digital goals.''',
                'keywords': ['about', 'what is', 'company', 'omni digitals', 'who'],
                'priority': 10,
            },
            {
                'category': 'about',
                'title': 'Our Mission',
                'content': '''Our mission at Omni Digitals is to empower businesses and individuals with professional digital services that drive growth and success.

We believe that every business deserves access to high-quality digital marketing and design services, regardless of size. We're committed to delivering exceptional value through creativity, expertise, and personalized attention.''',
                'keywords': ['mission', 'values', 'goal', 'purpose'],
                'priority': 8,
            },
            
            # Services
            {
                'category': 'services',
                'title': 'Social Media Marketing',
                'content': '''Our Social Media Marketing services help you build and engage your audience across all major platforms.

Services include:
- Content strategy and calendar planning
- Post creation and scheduling
- Community management and engagement
- Paid advertising campaigns
- Analytics and reporting
- Influencer collaboration

Platforms: Instagram, Facebook, Twitter/X, LinkedIn, TikTok, Pinterest, and more.''',
                'keywords': ['social media', 'marketing', 'instagram', 'facebook', 'tiktok', 'advertising'],
                'priority': 9,
            },
            {
                'category': 'services',
                'title': 'Graphic Design',
                'content': '''Our Graphic Design services help you create stunning visuals that capture attention and communicate your brand message.

Services include:
- Logo design and branding
- Social media graphics
- Marketing materials (flyers, brochures, banners)
- Infographics
- Presentation design
- Packaging design

All designs are delivered in multiple formats suitable for print and digital use.''',
                'keywords': ['graphic design', 'logo', 'branding', 'flyer', 'banner', 'design'],
                'priority': 9,
            },
            {
                'category': 'services',
                'title': 'Web Development',
                'content': '''Our Web Development services deliver modern, responsive websites that work beautifully on all devices.

Services include:
- Custom website design and development
- E-commerce solutions
- Landing pages
- Website maintenance and updates
- Performance optimization
- SEO-friendly structure

We use modern technologies to ensure your website is fast, secure, and easy to manage.''',
                'keywords': ['web', 'website', 'development', 'design', 'ecommerce', 'landing page'],
                'priority': 9,
            },
            {
                'category': 'services',
                'title': 'Content Creation',
                'content': '''Our Content Creation services help you tell your story and connect with your audience.

Services include:
- Blog writing and article creation
- Copywriting for ads and marketing
- Video scripts
- Social media captions
- Email marketing content
- Brand voice development

We create content that resonates with your audience and drives engagement.''',
                'keywords': ['content', 'writing', 'copywriting', 'blog', 'video', 'email'],
                'priority': 8,
            },
            {
                'category': 'services',
                'title': 'SEO Services',
                'content': '''Our SEO Services help your website rank higher in search results and attract more organic traffic.

Services include:
- Keyword research and strategy
- On-page optimization
- Technical SEO audits
- Content optimization
- Link building
- Local SEO

We use proven strategies to improve your visibility and drive sustainable growth.''',
                'keywords': ['seo', 'search engine', 'optimization', 'ranking', 'keywords', 'traffic'],
                'priority': 8,
            },
            {
                'category': 'services',
                'title': 'How to Request a Quote',
                'content': '''Getting a quote from Omni Digitals is easy:

1. Log in to your account (or create one)
2. Navigate to "Request Quotation" from the menu
3. Select the services you're interested in
4. Provide details about your project
5. Submit your request

Our team will review your request and send you a personalized quote within 24-48 hours. Quotes include detailed pricing and timeline estimates.''',
                'keywords': ['quote', 'quotation', 'pricing', 'cost', 'how much', 'estimate'],
                'priority': 10,
            },
            
            # Community Rules
            {
                'category': 'rules',
                'title': 'Community Guidelines',
                'content': '''Our community guidelines help maintain a positive and productive environment:

1. **Be Respectful**: Treat all members with courtesy and respect. No harassment, hate speech, or personal attacks.

2. **No Spam**: Don't post repetitive content, excessive self-promotion, or unsolicited advertisements.

3. **Stay On Topic**: Keep discussions relevant to digital services, marketing, and business growth.

4. **Report Issues**: If you see something that violates our guidelines, report it to our team.

5. **Constructive Feedback**: When providing feedback, be constructive and helpful.

Violations may result in warnings, temporary suspension, or permanent ban depending on severity.''',
                'keywords': ['rules', 'guidelines', 'community', 'policy', 'behavior'],
                'priority': 10,
            },
            
            # Gift Cards & Points
            {
                'category': 'gift_cards',
                'title': 'Points System',
                'content': '''Our points system rewards you for engaging with Omni Digitals:

**Earning Points:**
- Sign up: 100 points welcome bonus
- Complete a project: 50 points
- Refer a friend: 200 points
- Community engagement: 5-20 points per activity

**Point Values:**
- 1000 points = ₦5,000 or $3 service credit
- Points can be used on any service

Points are automatically credited to your account and never expire.''',
                'keywords': ['points', 'earn', 'reward', 'credit', 'redeem'],
                'priority': 9,
            },
            {
                'category': 'gift_cards',
                'title': 'Gift Card Tiers',
                'content': '''Our gift card tiers provide increasing benefits:

**Bronze (0-500 points)**
- Basic member benefits
- Standard support

**Silver (500-2000 points)**
- 5% discount on services
- Priority support

**Gold (2000-5000 points)**
- 10% discount on services
- Priority support
- Early access to new services

**Platinum (5000+ points)**
- 15% discount on services
- Dedicated account manager
- Exclusive member events

Your tier is based on your lifetime point accumulation.''',
                'keywords': ['tier', 'level', 'bronze', 'silver', 'gold', 'platinum', 'benefits'],
                'priority': 9,
            },
            
            # Account Help
            {
                'category': 'account',
                'title': 'Account Settings',
                'content': '''Manage your account settings:

**Profile Settings:**
- Click your avatar in the navigation bar
- Select "Profile" to update your information
- Add/change profile picture, name, contact info

**Notification Settings:**
- Control email and in-app notifications
- Set preferences for updates and promotions

**Security:**
- Change password from account settings
- Enable two-factor authentication (coming soon)

For help with your account, contact our support team.''',
                'keywords': ['account', 'settings', 'profile', 'password', 'notifications'],
                'priority': 8,
            },
            {
                'category': 'account',
                'title': 'How to Sign Up',
                'content': '''Creating an Omni Digitals account is simple:

1. Click "Sign Up" in the navigation bar
2. Choose to sign up with email or Google
3. Fill in your details (email, password)
4. Verify your email address
5. Complete your profile

Once registered, you can:
- Request service quotations
- Track your projects
- Earn points and rewards
- Join the community''',
                'keywords': ['signup', 'sign up', 'register', 'create account', 'join'],
                'priority': 9,
            },
            
            # Navigation
            {
                'category': 'navigation',
                'title': 'Site Navigation Guide',
                'content': '''Key pages on Omni Digitals:

- **Home**: Overview of our services and company
- **Services**: Detailed list of all services we offer
- **Request Quotation**: Get a custom quote for your project
- **Dashboard**: View your projects and account activity
- **Community**: Connect with other members
- **Profile**: Manage your account settings
- **Chat**: Contact our support team

The main navigation is at the top of every page. Log in to access all features.''',
                'keywords': ['navigate', 'find', 'where', 'page', 'menu', 'site'],
                'priority': 8,
            },
        ]

        for entry in entries:
            obj, created = KnowledgeBase.objects.get_or_create(
                title=entry['title'],
                defaults=entry
            )
            if created:
                self.stdout.write(f"  Created: {entry['title']}")
            else:
                self.stdout.write(f"  Exists: {entry['title']}")

    def seed_escalation_rules(self):
        """Seed escalation rules."""
        rules = [
            {
                'name': 'Payment Issues',
                'description': 'Escalate any payment, billing, or refund related queries',
                'trigger_keywords': ['refund', 'payment', 'billing', 'charge', 'charged', 'money back', 'invoice', 'transaction'],
                'trigger_phrases': ['i want my money', 'give me a refund', 'wrong charge'],
                'priority': 10,
            },
            {
                'name': 'Account Restrictions',
                'description': 'Escalate ban, suspension, or appeal requests',
                'trigger_keywords': ['banned', 'ban', 'suspended', 'suspension', 'blocked', 'terminated', 'appeal'],
                'trigger_phrases': ['why was i banned', 'unban me', 'restore my account'],
                'priority': 10,
            },
            {
                'name': 'Legal & Privacy',
                'description': 'Escalate legal or privacy concerns',
                'trigger_keywords': ['legal', 'lawyer', 'lawsuit', 'sue', 'privacy', 'gdpr', 'data deletion', 'data breach'],
                'trigger_phrases': ['i will sue', 'contact my lawyer', 'delete my data'],
                'priority': 10,
            },
            {
                'name': 'Human Request',
                'description': 'User explicitly requests human support',
                'trigger_keywords': [],
                'trigger_phrases': ['talk to a human', 'speak to someone', 'real person', 'not a bot'],
                'priority': 5,
            },
        ]

        for rule in rules:
            obj, created = EscalationRule.objects.get_or_create(
                name=rule['name'],
                defaults=rule
            )
            if created:
                self.stdout.write(f"  Created rule: {rule['name']}")
            else:
                self.stdout.write(f"  Exists: {rule['name']}")
