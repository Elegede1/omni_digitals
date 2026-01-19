from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    """AI chat session with a user."""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('escalated', 'Escalated'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_chat_sessions',
        null=True,
        blank=True  # Allow guest users
    )
    guest_session_id = models.CharField(max_length=100, blank=True)  # For non-logged-in users
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    escalated_at = models.DateTimeField(null=True, blank=True)
    escalation_reason = models.TextField(blank=True)
    assigned_admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_ai_chats'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        identifier = self.user.email if self.user else f"Guest-{self.guest_session_id[:8]}"
        return f"Chat {self.id} - {identifier} [{self.status}]"


class ChatMessage(models.Model):
    """Individual message in AI chat."""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)  # For storing intent, tokens, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}..."


class KnowledgeBase(models.Model):
    """Searchable knowledge articles for RAG."""
    CATEGORY_CHOICES = [
        ('about', 'About Omni Digitals'),
        ('services', 'Services'),
        ('rules', 'Community Rules'),
        ('gift_cards', 'Gift Cards & Points'),
        ('account', 'Account Help'),
        ('faq', 'FAQ'),
        ('navigation', 'Site Navigation'),
    ]

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    keywords = models.JSONField(default=list, blank=True)
    priority = models.IntegerField(default=0)  # Higher = more relevant
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', 'title']
        verbose_name_plural = 'Knowledge Base Entries'

    def __str__(self):
        return f"[{self.category}] {self.title}"


class EscalationRule(models.Model):
    """Rules for automatic escalation to human support."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    trigger_keywords = models.JSONField(default=list)  # ['refund', 'payment', 'ban']
    trigger_phrases = models.JSONField(default=list)  # ['i want my money back']
    response_template = models.TextField(
        default="This issue requires human review. I'm forwarding it to our support team. A team member will respond shortly."
    )
    priority = models.IntegerField(default=0)  # Higher = check first
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority', 'name']

    def __str__(self):
        return f"Escalation: {self.name}"


class AutomationLog(models.Model):
    """Log of automated actions taken by Omni Assist."""
    ACTION_TYPES = [
        ('auto_reply', 'Auto Reply Sent'),
        ('escalation', 'Escalated to Human'),
        ('classification', 'Message Classified'),
        ('summarization', 'Chat Summarized'),
        ('draft_reply', 'Reply Drafted'),
    ]

    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, null=True, blank=True)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, null=True, blank=True)
    details = models.JSONField(default=dict)
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action_type} at {self.created_at}"
