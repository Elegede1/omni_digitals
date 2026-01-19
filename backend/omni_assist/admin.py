from django.contrib import admin
from .models import ChatSession, ChatMessage, KnowledgeBase, EscalationRule, AutomationLog


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_display', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'guest_session_id', 'escalation_reason']
    readonly_fields = ['created_at', 'updated_at']
    
    def user_display(self, obj):
        if obj.user:
            return obj.user.email
        return f"Guest-{obj.guest_session_id[:8]}"
    user_display.short_description = 'User'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'content_preview', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'is_active', 'updated_at']
    list_filter = ['category', 'is_active']
    search_fields = ['title', 'content', 'keywords']
    list_editable = ['priority', 'is_active']


@admin.register(EscalationRule)
class EscalationRuleAdmin(admin.ModelAdmin):
    list_display = ['name', 'priority', 'is_active', 'created_at']
    list_filter = ['is_active']
    list_editable = ['priority', 'is_active']


@admin.register(AutomationLog)
class AutomationLogAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'session', 'tokens_used', 'created_at']
    list_filter = ['action_type', 'created_at']
    readonly_fields = ['created_at']
