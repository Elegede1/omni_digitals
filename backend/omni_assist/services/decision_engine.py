"""
Decision Engine for Omni Assist.
Handles intent classification and escalation logic.
"""
import re
import logging
from typing import Tuple, Optional, List, Dict
from django.db.models import Q

logger = logging.getLogger(__name__)


class DecisionEngine:
    """
    Core decision logic for determining AI responses vs escalation.
    Implements the autonomy rules defined in the AI integration plan.
    """
    
    # Topics the AI can handle autonomously
    AUTONOMOUS_TOPICS = {
        'about': 'About Omni Digitals',
        'services': 'Services Offered',
        'rules': 'Community Rules',
        'gift_cards': 'Gift Cards & Points',
        'account': 'Account Help',
        'navigation': 'Site Navigation',
        'faq': 'General FAQ',
    }
    
    # Topics that MUST be escalated to human support
    ESCALATION_TOPICS = {
        'payment': 'Payment or Billing Issue',
        'refund': 'Refund Request',
        'ban': 'Account Ban or Suspension',
        'appeal': 'Appeal Request',
        'conflict': 'Member Conflict',
        'legal': 'Legal Concern',
        'privacy': 'Privacy Issue',
        'partnership': 'Business Partnership',
    }
    
    # Keywords that trigger escalation
    ESCALATION_KEYWORDS = [
        # Payment/Financial
        'refund', 'money back', 'charge', 'charged', 'billing', 'invoice',
        'payment', 'pay', 'paid', 'transaction', 'fraud', 'scam',
        
        # Account Issues
        'banned', 'ban', 'suspended', 'suspension', 'blocked', 'terminated',
        'appeal', 'unban', 'restore', 'locked out',
        
        # Conflicts
        'harass', 'harassment', 'threat', 'threatening', 'abuse', 'abusive',
        'sue', 'lawyer', 'legal action', 'police', 'report user',
        
        # Legal/Privacy
        'legal', 'lawsuit', 'privacy', 'data', 'gdpr', 'delete my data',
        'personal information', 'security breach',
        
        # Business
        'partnership', 'partner', 'invest', 'business deal', 'contract',
        'collaboration', 'sponsorship',
    ]
    
    # Phrases that strongly indicate escalation need
    ESCALATION_PHRASES = [
        'i want my money',
        'give me a refund',
        'why was i banned',
        'unban me',
        'this is illegal',
        'i will sue',
        'contact my lawyer',
        'talk to a human',
        'speak to manager',
        'real person please',
        'not a bot',
    ]
    
    # Standard escalation response
    ESCALATION_RESPONSE = (
        "This issue requires human review. I'm forwarding it to our support team. "
        "A team member will respond shortly."
    )
    
    def __init__(self):
        self._cached_rules = None
    
    def _load_escalation_rules(self) -> List[Dict]:
        """Load custom escalation rules from database."""
        if self._cached_rules is not None:
            return self._cached_rules
        
        try:
            from omni_assist.models import EscalationRule
            rules = EscalationRule.objects.filter(is_active=True).values(
                'trigger_keywords', 'trigger_phrases', 'response_template', 'priority'
            )
            self._cached_rules = list(rules)
        except Exception as e:
            logger.warning(f"Could not load escalation rules: {e}")
            self._cached_rules = []
        
        return self._cached_rules
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for matching."""
        return text.lower().strip()
    
    def _check_keywords(self, message: str) -> Optional[str]:
        """Check if message contains any escalation keywords."""
        normalized = self._normalize_text(message)
        
        for keyword in self.ESCALATION_KEYWORDS:
            if keyword in normalized:
                return keyword
        
        # Check custom rules from database
        for rule in self._load_escalation_rules():
            for keyword in rule.get('trigger_keywords', []):
                if keyword.lower() in normalized:
                    return keyword
        
        return None
    
    def _check_phrases(self, message: str) -> Optional[str]:
        """Check if message contains any escalation phrases."""
        normalized = self._normalize_text(message)
        
        for phrase in self.ESCALATION_PHRASES:
            if phrase in normalized:
                return phrase
        
        # Check custom rules from database
        for rule in self._load_escalation_rules():
            for phrase in rule.get('trigger_phrases', []):
                if phrase.lower() in normalized:
                    return phrase
        
        return None
    
    def should_escalate(self, message: str, context: Optional[Dict] = None) -> Tuple[bool, str]:
        """
        Determine if a message should be escalated to human support.
        
        Args:
            message: The user's message
            context: Optional context (previous messages, user info, etc.)
            
        Returns:
            Tuple of (should_escalate, reason)
        """
        # Check for keyword triggers
        matched_keyword = self._check_keywords(message)
        if matched_keyword:
            return True, f"Keyword trigger: '{matched_keyword}'"
        
        # Check for phrase triggers
        matched_phrase = self._check_phrases(message)
        if matched_phrase:
            return True, f"Phrase trigger: '{matched_phrase}'"
        
        # Check for explicit human request patterns
        human_patterns = [
            r'\bhuman\b',
            r'\breal person\b',
            r'\bspeak to someone\b',
            r'\btalk to (a |the )?manager\b',
            r'\bescalate\b',
        ]
        
        for pattern in human_patterns:
            if re.search(pattern, message.lower()):
                return True, "User requested human assistance"
        
        return False, ""
    
    def classify_intent(self, message: str) -> str:
        """
        Classify the user's message intent.
        Returns a category string.
        """
        normalized = self._normalize_text(message)
        
        # First check escalation triggers
        should_esc, _ = self.should_escalate(message)
        if should_esc:
            return 'escalation'
        
        # Category keyword mapping
        category_keywords = {
            'about': ['what is omni', 'who is omni', 'about omni', 'tell me about', 'what do you do'],
            'services': ['service', 'offer', 'provide', 'marketing', 'design', 'web', 'seo', 'advertising'],
            'rules': ['rule', 'guideline', 'policy', 'allowed', 'prohibited', 'community'],
            'gift_cards': ['gift card', 'points', 'reward', 'level', 'tier', 'redeem', 'balance'],
            'account': ['account', 'profile', 'password', 'email', 'settings', 'login', 'sign'],
            'navigation': ['how to', 'where', 'find', 'navigate', 'use', 'page', 'button'],
        }
        
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in normalized:
                    return category
        
        return 'general'
    
    def get_topic_context(self, category: str) -> str:
        """Get additional context prompt for a topic category."""
        from omni_assist.prompts.system_prompt import TOPIC_PROMPTS
        return TOPIC_PROMPTS.get(category, '')
    
    def get_escalation_response(self) -> str:
        """Get the standard escalation response."""
        return self.ESCALATION_RESPONSE


# Singleton instance
_engine_instance = None


def get_decision_engine() -> DecisionEngine:
    """Get or create the decision engine singleton."""
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = DecisionEngine()
    return _engine_instance
