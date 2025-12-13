from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings

class CustomUserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    def _create_user(self, email, password=None, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    onboarding_complete = models.BooleanField(default=False)
    
    # Contact information
    phone = models.CharField(max_length=20, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    telegram = models.CharField(max_length=100, blank=True, null=True)
    
    # Business information
    business_name = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.user.email

class Quotation(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Pending', 'Pending'),
        ('Reviewed', 'Reviewed'),
        ('Paid', 'Paid'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quotations')
    quotation_id = models.CharField(max_length=20, unique=True, editable=False)
    selected_services = models.JSONField()  # List of service names and details
    price_estimate_min_naira = models.DecimalField(max_digits=12, decimal_places=2)
    price_estimate_max_naira = models.DecimalField(max_digits=12, decimal_places=2)
    price_estimate_min_dollar = models.DecimalField(max_digits=12, decimal_places=2)
    price_estimate_max_dollar = models.DecimalField(max_digits=12, decimal_places=2)
    duration = models.CharField(max_length=200, blank=True)
    additional_info = models.TextField(blank=True)
    contact_method = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.quotation_id} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.quotation_id:
            # Generate unique quotation ID
            import random
            import string
            from django.utils import timezone
            timestamp = timezone.now().strftime('%Y%m%d')
            random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            self.quotation_id = f"QT-{timestamp}-{random_suffix}"
        super().save(*args, **kwargs)

class Report(models.Model):
    REPORT_TYPES = [
        ('Harassment', 'Harassment'),
        ('Spam', 'Spam'),
        ('Inappropriate Content', 'Inappropriate Content'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Resolved', 'Resolved'),
        ('Dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_filed')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report {self.id} by {self.reporter.email} - {self.status}"


class CommunityPost(models.Model):
    """Community post model - supports both registered and guest users."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='community_posts'
    )
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    title = models.CharField(max_length=300)
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        author = self.user.email if self.user else self.guest_name
        return f"{self.title[:50]} by {author}"

    @property
    def author_name(self):
        if self.user:
            return self.user.get_full_name() or self.user.email
        return self.guest_name

    @property
    def author_avatar(self):
        if self.user and hasattr(self.user, 'profile') and self.user.profile.profile_picture:
            return self.user.profile.profile_picture.url
        return None


class Comment(models.Model):
    """Comment model for community posts."""
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='post_comments'
    )
    guest_name = models.CharField(max_length=100, blank=True)
    guest_email = models.EmailField(blank=True)
    content = models.TextField()
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        author = self.user.email if self.user else self.guest_name
        return f"Comment by {author} on {self.post.title[:30]}"

    @property
    def author_name(self):
        if self.user:
            return self.user.get_full_name() or self.user.email
        return self.guest_name


class Notification(models.Model):
    """Notification model for user alerts."""
    NOTIFICATION_TYPES = [
        ('welcome', 'Welcome Message'),
        ('comment_reply', 'Comment Reply'),
        ('admin_message', 'Admin Message'),
        ('post_mention', 'Post Mention'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='admin_message')
    is_read = models.BooleanField(default=False)
    related_post = models.ForeignKey(
        CommunityPost,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    related_url = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email}: {self.message[:50]}"


class PostLike(models.Model):
    """Track likes on posts - one like per user per post."""
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='post_likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'user']

    def __str__(self):
        return f"{self.user.email} liked {self.post.title[:30]}"


class CommentLike(models.Model):
    """Track likes on comments - one like per user per comment."""
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='comment_likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='liked_comments')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['comment', 'user']

    def __str__(self):
        return f"{self.user.email} liked comment {self.comment.id}"


class Message(models.Model):
    """Message model for internal chat system."""
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"

class MessageReaction(models.Model):
    """Reaction to a chat message."""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user', 'emoji'] # One type of emoji per user per message? Or just unique user/message? Let's allow multiple emojis per user for now, or restrict. Usually one reaction per user per message is common, or different types. Let's stick to unique user+emoji or just allow any. The prompt says "allow emoji reactions".
        # Let's enforce unique emoji per user per message to prevent spamming SAME emoji.
        unique_together = ['message', 'user', 'emoji']

    def __str__(self):
        return f"{self.user} reacted {self.emoji} to {self.message.id}"
