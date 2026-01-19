"""
Knowledge Base Service for Omni Assist.
Handles retrieval and matching of knowledge base content.
"""
import logging
from typing import List, Dict, Optional
from django.db.models import Q

logger = logging.getLogger(__name__)


class KnowledgeBaseService:
    """
    Service for managing and querying the knowledge base.
    Provides simple keyword-based retrieval for context injection.
    """
    
    def search(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 3
    ) -> List[Dict]:
        """
        Search knowledge base for relevant articles.
        
        Args:
            query: Search query
            category: Optional category filter
            limit: Maximum number of results
            
        Returns:
            List of matching knowledge entries
        """
        from omni_assist.models import KnowledgeBase
        
        # Tokenize query
        query_words = query.lower().split()
        
        # Build search filter
        filters = Q(is_active=True)
        
        if category:
            filters &= Q(category=category)
        
        # Search in title, content, and keywords
        search_filter = Q()
        for word in query_words:
            if len(word) > 2:  # Ignore very short words
                search_filter |= (
                    Q(title__icontains=word) |
                    Q(content__icontains=word) |
                    Q(keywords__contains=word)
                )
        
        if search_filter:
            filters &= search_filter
        
        entries = KnowledgeBase.objects.filter(filters).order_by('-priority')[:limit]
        
        return [
            {
                'id': e.id,
                'category': e.category,
                'title': e.title,
                'content': e.content,
                'keywords': e.keywords
            }
            for e in entries
        ]
    
    def get_by_category(self, category: str) -> List[Dict]:
        """Get all active entries in a category."""
        from omni_assist.models import KnowledgeBase
        
        entries = KnowledgeBase.objects.filter(
            category=category,
            is_active=True
        ).order_by('-priority', 'title')
        
        return [
            {
                'id': e.id,
                'title': e.title,
                'content': e.content,
            }
            for e in entries
        ]
    
    def get_context_for_query(self, query: str) -> str:
        """
        Get relevant knowledge base content as context for AI.
        
        Returns a formatted string of relevant content to inject into prompts.
        """
        results = self.search(query, limit=3)
        
        if not results:
            return ""
        
        context_parts = ["## Relevant Information from Knowledge Base:\n"]
        
        for entry in results:
            context_parts.append(f"### {entry['title']}")
            context_parts.append(entry['content'])
            context_parts.append("")
        
        return "\n".join(context_parts)
    
    def add_entry(
        self,
        category: str,
        title: str,
        content: str,
        keywords: Optional[List[str]] = None,
        priority: int = 0
    ) -> Dict:
        """Add a new knowledge base entry."""
        from omni_assist.models import KnowledgeBase
        
        entry = KnowledgeBase.objects.create(
            category=category,
            title=title,
            content=content,
            keywords=keywords or [],
            priority=priority
        )
        
        return {
            'id': entry.id,
            'category': entry.category,
            'title': entry.title,
            'created': True
        }
    
    def update_entry(self, entry_id: int, **kwargs) -> bool:
        """Update an existing knowledge base entry."""
        from omni_assist.models import KnowledgeBase
        
        try:
            entry = KnowledgeBase.objects.get(id=entry_id)
            for key, value in kwargs.items():
                if hasattr(entry, key):
                    setattr(entry, key, value)
            entry.save()
            return True
        except KnowledgeBase.DoesNotExist:
            return False


# Singleton instance
_kb_service_instance = None


def get_knowledge_base_service() -> KnowledgeBaseService:
    """Get or create the knowledge base service singleton."""
    global _kb_service_instance
    if _kb_service_instance is None:
        _kb_service_instance = KnowledgeBaseService()
    return _kb_service_instance
