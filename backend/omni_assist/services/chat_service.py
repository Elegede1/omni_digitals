"""
Chat Service for Omni Assist.
Handles the main chat logic, session management, and response generation.
"""
import logging
from typing import Optional, Dict, Any, List
from django.utils import timezone
from django.db import transaction

from .llm_client import get_gemini_client
from .decision_engine import get_decision_engine
from ..prompts.system_prompt import OMNI_ASSIST_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class ChatService:
    """
    Main service for handling Omni Assist chat interactions.
    Coordinates between the LLM client, decision engine, and database.
    """
    
    def __init__(self):
        self.llm = get_gemini_client()
        self.decision_engine = get_decision_engine()
    
    def get_or_create_session(
        self,
        user=None,
        guest_session_id: Optional[str] = None
    ):
        """
        Get existing active session or create a new one.
        """
        from omni_assist.models import ChatSession
        
        if user:
            session = ChatSession.objects.filter(
                user=user,
                status='active'
            ).order_by('-updated_at').first()
            
            if not session:
                session = ChatSession.objects.create(user=user)
                
        elif guest_session_id:
            session = ChatSession.objects.filter(
                guest_session_id=guest_session_id,
                status='active'
            ).order_by('-updated_at').first()
            
            if not session:
                session = ChatSession.objects.create(guest_session_id=guest_session_id)
        else:
            # Create anonymous session
            import uuid
            session = ChatSession.objects.create(guest_session_id=str(uuid.uuid4()))
        
        return session
    
    def get_conversation_history(self, session, max_messages: int = 10) -> List[Dict]:
        """Get recent messages from a session for context."""
        from omni_assist.models import ChatMessage
        
        messages = ChatMessage.objects.filter(
            session=session
        ).order_by('-created_at')[:max_messages]
        
        # Reverse to get chronological order
        messages = list(reversed(messages))
        
        return [
            {'role': msg.role, 'content': msg.content}
            for msg in messages
        ]
    
    def save_message(self, session, role: str, content: str, metadata: Optional[Dict] = None):
        """Save a message to the session."""
        from omni_assist.models import ChatMessage
        
        return ChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            metadata=metadata or {}
        )
    
    def escalate_session(self, session, reason: str):
        """Mark a session as escalated."""
        from omni_assist.models import AutomationLog
        
        session.status = 'escalated'
        session.escalated_at = timezone.now()
        session.escalation_reason = reason
        session.save()
        
        # Log the escalation
        AutomationLog.objects.create(
            action_type='escalation',
            session=session,
            details={'reason': reason}
        )
        
        # TODO: Send notification to admins
        logger.info(f"Session {session.id} escalated: {reason}")
    
    def process_message(
        self,
        message: str,
        user=None,
        guest_session_id: Optional[str] = None,
        session_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and generate an AI response.
        
        Args:
            message: The user's message
            user: Authenticated user (if any)
            guest_session_id: Guest session ID (for anonymous users)
            session_id: Existing session ID (if continuing conversation)
            
        Returns:
            Dict containing:
                - response: AI response text
                - session_id: The chat session ID
                - escalated: Whether the message was escalated
                - intent: Classified intent category
        """
        from omni_assist.models import ChatSession
        
        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id)
                # Verify ownership
                if user and session.user != user:
                    session = self.get_or_create_session(user=user)
                elif guest_session_id and session.guest_session_id != guest_session_id:
                    session = self.get_or_create_session(guest_session_id=guest_session_id)
            except ChatSession.DoesNotExist:
                session = self.get_or_create_session(user=user, guest_session_id=guest_session_id)
        else:
            session = self.get_or_create_session(user=user, guest_session_id=guest_session_id)
        
        # Save user message
        self.save_message(session, 'user', message)
        
        # Check for escalation triggers
        should_escalate, escalation_reason = self.decision_engine.should_escalate(message)
        
        if should_escalate:
            # Escalate to human support
            self.escalate_session(session, escalation_reason)
            response_text = self.decision_engine.get_escalation_response()
            
            # Save escalation response
            self.save_message(session, 'assistant', response_text, {
                'escalated': True,
                'reason': escalation_reason
            })
            
            return {
                'response': response_text,
                'session_id': session.id,
                'escalated': True,
                'intent': 'escalation',
                'reason': escalation_reason
            }
        
        # Classify intent for context
        intent = self.decision_engine.classify_intent(message)
        topic_context = self.decision_engine.get_topic_context(intent)
        
        # Build system prompt with topic context
        system_prompt = OMNI_ASSIST_SYSTEM_PROMPT
        if topic_context:
            system_prompt += f"\n\n## Current Topic Context\n{topic_context}"
        
        # Get conversation history for context
        history = self.get_conversation_history(session)
        
        # Generate AI response
        result = self.llm.generate_response(
            prompt=message,
            system_instruction=system_prompt,
            conversation_history=history[:-1] if history else None,  # Exclude just-added message
            temperature=0.7
        )
        
        response_text = result.get('content', '')
        
        # Save assistant response
        self.save_message(session, 'assistant', response_text, {
            'tokens_used': result.get('tokens_used', 0),
            'intent': intent,
            'success': result.get('success', False)
        })
        
        # Update session timestamp
        session.save()  # Triggers auto_now on updated_at
        
        return {
            'response': response_text,
            'session_id': session.id,
            'escalated': False,
            'intent': intent,
            'tokens_used': result.get('tokens_used', 0)
        }
    
    def get_session_history(self, session_id: int, user=None) -> List[Dict]:
        """Get full message history for a session."""
        from omni_assist.models import ChatSession, ChatMessage
        
        try:
            session = ChatSession.objects.get(id=session_id)
            
            # Verify access
            if user and session.user != user:
                return []
            
            messages = ChatMessage.objects.filter(session=session).order_by('created_at')
            
            return [
                {
                    'id': msg.id,
                    'role': msg.role,
                    'content': msg.content,
                    'timestamp': msg.created_at.isoformat(),
                }
                for msg in messages
            ]
        except ChatSession.DoesNotExist:
            return []
    
    def close_session(self, session_id: int, user=None):
        """Close a chat session."""
        from omni_assist.models import ChatSession
        
        try:
            session = ChatSession.objects.get(id=session_id)
            
            if user and session.user != user:
                return False
            
            session.status = 'closed'
            session.save()
            return True
        except ChatSession.DoesNotExist:
            return False


# Singleton instance
_service_instance = None


def get_chat_service() -> ChatService:
    """Get or create the chat service singleton."""
    global _service_instance
    if _service_instance is None:
        _service_instance = ChatService()
    return _service_instance
