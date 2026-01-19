"""
Admin Tools Service for Omni Assist.
Provides AI-powered tools for admin staff: summarization, reply drafting, analytics.
"""
import logging
from typing import Dict, Any, List, Optional
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from .llm_client import get_gemini_client
from ..prompts.system_prompt import SUMMARIZATION_PROMPT, REPLY_DRAFT_PROMPT

logger = logging.getLogger(__name__)


class AdminToolsService:
    """
    AI-powered tools for admin staff to manage support efficiently.
    """
    
    def __init__(self):
        self.llm = get_gemini_client()
    
    def summarize_chat_session(self, session_id: int) -> Dict[str, Any]:
        """
        Generate a summary of a chat session.
        
        Args:
            session_id: The chat session to summarize
            
        Returns:
            Dict with 'summary', 'success', and optional 'error'
        """
        from omni_assist.models import ChatSession, ChatMessage, AutomationLog
        
        try:
            session = ChatSession.objects.get(id=session_id)
            messages = ChatMessage.objects.filter(session=session).order_by('created_at')
            
            if not messages.exists():
                return {
                    'summary': 'No messages in this session.',
                    'success': True
                }
            
            # Format conversation for summarization
            conversation_text = "\n".join([
                f"[{msg.role.upper()}]: {msg.content}"
                for msg in messages
            ])
            
            prompt = f"{SUMMARIZATION_PROMPT}\n\nConversation:\n{conversation_text}"
            
            result = self.llm.generate_simple(prompt)
            
            # Log the action
            AutomationLog.objects.create(
                action_type='summarization',
                session=session,
                details={'summary_length': len(result)}
            )
            
            return {
                'summary': result,
                'success': True,
                'session_status': session.status,
                'message_count': messages.count()
            }
            
        except ChatSession.DoesNotExist:
            return {
                'summary': '',
                'success': False,
                'error': 'Session not found'
            }
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return {
                'summary': '',
                'success': False,
                'error': str(e)
            }
    
    def draft_reply(
        self,
        session_id: int,
        user_message_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Draft a reply for the admin to review and send.
        
        Args:
            session_id: The chat session
            user_message_id: Specific message to reply to (optional)
            
        Returns:
            Dict with 'draft', 'success', and optional 'error'
        """
        from omni_assist.models import ChatSession, ChatMessage, AutomationLog
        
        try:
            session = ChatSession.objects.get(id=session_id)
            
            # Get message to reply to
            if user_message_id:
                target_message = ChatMessage.objects.get(
                    id=user_message_id,
                    session=session
                )
            else:
                # Get last user message
                target_message = ChatMessage.objects.filter(
                    session=session,
                    role='user'
                ).order_by('-created_at').first()
            
            if not target_message:
                return {
                    'draft': '',
                    'success': False,
                    'error': 'No user message found to reply to'
                }
            
            # Get conversation context
            messages = ChatMessage.objects.filter(
                session=session,
                created_at__lte=target_message.created_at
            ).order_by('created_at')
            
            context_text = "\n".join([
                f"[{msg.role.upper()}]: {msg.content}"
                for msg in messages[-10:]  # Last 10 messages
            ])
            
            prompt = REPLY_DRAFT_PROMPT.format(
                context=context_text,
                message=target_message.content
            )
            
            result = self.llm.generate_simple(prompt)
            
            # Log the action
            AutomationLog.objects.create(
                action_type='draft_reply',
                session=session,
                message=target_message,
                details={'draft_length': len(result)}
            )
            
            return {
                'draft': result,
                'success': True,
                'replying_to': {
                    'id': target_message.id,
                    'content': target_message.content[:100]
                }
            }
            
        except ChatSession.DoesNotExist:
            return {
                'draft': '',
                'success': False,
                'error': 'Session not found'
            }
        except ChatMessage.DoesNotExist:
            return {
                'draft': '',
                'success': False,
                'error': 'Message not found'
            }
        except Exception as e:
            logger.error(f"Reply drafting error: {e}")
            return {
                'draft': '',
                'success': False,
                'error': str(e)
            }
    
    def get_analytics(self, days: int = 7) -> Dict[str, Any]:
        """
        Get AI chat analytics for the specified period.
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Dict with analytics data
        """
        from omni_assist.models import ChatSession, ChatMessage, AutomationLog
        
        start_date = timezone.now() - timedelta(days=days)
        
        # Session stats
        sessions = ChatSession.objects.filter(created_at__gte=start_date)
        session_stats = {
            'total': sessions.count(),
            'active': sessions.filter(status='active').count(),
            'escalated': sessions.filter(status='escalated').count(),
            'closed': sessions.filter(status='closed').count(),
        }
        
        # Calculate escalation rate
        if session_stats['total'] > 0:
            session_stats['escalation_rate'] = round(
                (session_stats['escalated'] / session_stats['total']) * 100, 1
            )
        else:
            session_stats['escalation_rate'] = 0
        
        # Message stats
        messages = ChatMessage.objects.filter(created_at__gte=start_date)
        message_stats = {
            'total': messages.count(),
            'from_users': messages.filter(role='user').count(),
            'from_assistant': messages.filter(role='assistant').count(),
        }
        
        # Intent distribution
        intent_counts = {}
        for msg in messages.filter(role='user'):
            intent = msg.metadata.get('intent', 'unknown')
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        # Automation log stats
        automation_stats = AutomationLog.objects.filter(
            created_at__gte=start_date
        ).values('action_type').annotate(count=Count('id'))
        
        # Token usage
        token_usage = sum(
            msg.metadata.get('tokens_used', 0)
            for msg in messages.filter(role='assistant')
        )
        
        return {
            'period_days': days,
            'sessions': session_stats,
            'messages': message_stats,
            'intent_distribution': intent_counts,
            'automation_actions': list(automation_stats),
            'estimated_tokens': token_usage,
        }
    
    def get_escalated_sessions(self, limit: int = 20) -> List[Dict]:
        """Get recent escalated sessions for admin review."""
        from omni_assist.models import ChatSession
        
        sessions = ChatSession.objects.filter(
            status='escalated'
        ).select_related('user', 'assigned_admin').order_by('-escalated_at')[:limit]
        
        return [
            {
                'id': s.id,
                'user_email': s.user.email if s.user else f"Guest-{s.guest_session_id[:8]}",
                'escalation_reason': s.escalation_reason,
                'escalated_at': s.escalated_at.isoformat() if s.escalated_at else None,
                'assigned_to': s.assigned_admin.email if s.assigned_admin else None,
                'message_count': s.messages.count()
            }
            for s in sessions
        ]
    
    def assign_session(self, session_id: int, admin_user) -> bool:
        """Assign an escalated session to an admin."""
        from omni_assist.models import ChatSession
        
        try:
            session = ChatSession.objects.get(id=session_id)
            session.assigned_admin = admin_user
            session.save()
            return True
        except ChatSession.DoesNotExist:
            return False


# Singleton instance
_admin_tools_instance = None


def get_admin_tools() -> AdminToolsService:
    """Get or create the admin tools service singleton."""
    global _admin_tools_instance
    if _admin_tools_instance is None:
        _admin_tools_instance = AdminToolsService()
    return _admin_tools_instance
