"""
Omni Assist API Views.
Endpoints for user-facing chat and admin AI tools.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
import uuid

from .services.chat_service import get_chat_service
from .services.admin_tools import get_admin_tools
from .services.knowledge_base import get_knowledge_base_service


# ============================================
# User-Facing Chat Endpoints
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def omni_assist_chat(request):
    """
    Main chat endpoint for Omni Assist.
    Accepts messages and returns AI responses.
    
    POST /api/omni-assist/chat/
    {
        "message": "What services do you offer?",
        "session_id": 123  // optional, for continuing a conversation
    }
    
    Response:
    {
        "response": "Omni Digitals offers...",
        "session_id": 123,
        "escalated": false,
        "intent": "services"
    }
    """
    message = request.data.get('message', '').strip()
    session_id = request.data.get('session_id')
    
    if not message:
        return Response(
            {"error": "Message is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get guest session ID from request or generate new one
    guest_session_id = request.data.get('guest_session_id')
    if not request.user.is_authenticated and not guest_session_id:
        guest_session_id = str(uuid.uuid4())
    
    chat_service = get_chat_service()
    
    result = chat_service.process_message(
        message=message,
        user=request.user if request.user.is_authenticated else None,
        guest_session_id=guest_session_id,
        session_id=session_id
    )
    
    response_data = {
        'response': result.get('response', ''),
        'session_id': result.get('session_id'),
        'escalated': result.get('escalated', False),
        'intent': result.get('intent', 'general'),
    }
    
    # Include guest_session_id for anonymous users
    if not request.user.is_authenticated:
        response_data['guest_session_id'] = guest_session_id
    
    return Response(response_data)


@api_view(['GET'])
@permission_classes([AllowAny])
def omni_assist_history(request):
    """
    Get chat history for a session.
    
    GET /api/omni-assist/history/?session_id=123
    or for guests:
    GET /api/omni-assist/history/?guest_session_id=abc-123
    """
    session_id = request.query_params.get('session_id')
    guest_session_id = request.query_params.get('guest_session_id')
    
    if not session_id and not guest_session_id:
        return Response(
            {"error": "session_id or guest_session_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    chat_service = get_chat_service()
    
    if session_id:
        try:
            session_id = int(session_id)
        except ValueError:
            return Response(
                {"error": "Invalid session_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        history = chat_service.get_session_history(
            session_id=session_id,
            user=request.user if request.user.is_authenticated else None
        )
    else:
        # For guest sessions, need to find by guest_session_id
        from .models import ChatSession
        session = ChatSession.objects.filter(
            guest_session_id=guest_session_id,
            status='active'
        ).first()
        
        if session:
            history = chat_service.get_session_history(session_id=session.id)
        else:
            history = []
    
    return Response({
        'messages': history,
        'session_id': session_id
    })





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def omni_assist_close_session(request):
    """
    Close a chat session.
    
    POST /api/omni-assist/close/
    {"session_id": 123}
    """
    session_id = request.data.get('session_id')
    
    if not session_id:
        return Response(
            {"error": "session_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    chat_service = get_chat_service()
    success = chat_service.close_session(
        session_id=session_id,
        user=request.user
    )
    
    return Response({'success': success})


# ============================================
# Admin AI Tools Endpoints
# ============================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_ai_sessions(request):
    """
    Get AI chat sessions for admin review.
    
    GET /api/admin/ai/sessions/?status=escalated&limit=20
    """
    filter_status = request.query_params.get('status', 'escalated')
    limit = int(request.query_params.get('limit', 20))
    
    from .models import ChatSession
    
    sessions = ChatSession.objects.select_related(
        'user', 'assigned_admin'
    ).order_by('-updated_at')
    
    if filter_status and filter_status != 'all':
        sessions = sessions.filter(status=filter_status)
    
    sessions = sessions[:limit]
    
    data = [
        {
            'id': s.id,
            'user': s.user.email if s.user else f"Guest-{s.guest_session_id[:8]}",
            'status': s.status,
            'escalation_reason': s.escalation_reason,
            'escalated_at': s.escalated_at.isoformat() if s.escalated_at else None,
            'assigned_to': s.assigned_admin.email if s.assigned_admin else None,
            'message_count': s.messages.count(),
            'created_at': s.created_at.isoformat(),
            'updated_at': s.updated_at.isoformat(),
        }
        for s in sessions
    ]
    
    return Response({'sessions': data})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_session_detail(request, session_id):
    """
    Get detailed view of a chat session with all messages.
    
    GET /api/admin/ai/sessions/<session_id>/
    """
    from .models import ChatSession, ChatMessage
    
    try:
        session = ChatSession.objects.select_related(
            'user', 'assigned_admin'
        ).get(id=session_id)
    except ChatSession.DoesNotExist:
        return Response(
            {"error": "Session not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    messages = ChatMessage.objects.filter(session=session).order_by('created_at')
    
    return Response({
        'session': {
            'id': session.id,
            'user': session.user.email if session.user else f"Guest-{session.guest_session_id[:8]}",
            'status': session.status,
            'escalation_reason': session.escalation_reason,
            'created_at': session.created_at.isoformat(),
        },
        'messages': [
            {
                'id': m.id,
                'role': m.role,
                'content': m.content,
                'timestamp': m.created_at.isoformat(),
                'metadata': m.metadata
            }
            for m in messages
        ]
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_summarize_chat(request, session_id):
    """
    Generate AI summary of a chat session.
    
    POST /api/admin/ai/sessions/<session_id>/summarize/
    """
    admin_tools = get_admin_tools()
    result = admin_tools.summarize_chat_session(session_id)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_draft_reply(request, session_id):
    """
    Generate a draft reply for admin to review.
    
    POST /api/admin/ai/sessions/<session_id>/draft-reply/
    {"message_id": 456}  // optional, defaults to last user message
    """
    message_id = request.data.get('message_id')
    
    admin_tools = get_admin_tools()
    result = admin_tools.draft_reply(
        session_id=session_id,
        user_message_id=message_id
    )
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_assign_session(request, session_id):
    """
    Assign an escalated session to an admin.
    
    POST /api/admin/ai/sessions/<session_id>/assign/
    """
    admin_tools = get_admin_tools()
    success = admin_tools.assign_session(session_id, request.user)
    
    return Response({'success': success})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_ai_analytics(request):
    """
    Get AI usage analytics.
    
    GET /api/admin/ai/analytics/?days=7
    """
    days = int(request.query_params.get('days', 7))
    
    admin_tools = get_admin_tools()
    analytics = admin_tools.get_analytics(days=days)
    
    return Response(analytics)


# ============================================
# Knowledge Base Management
# ============================================

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_knowledge_base(request):
    """
    Manage knowledge base entries.
    
    GET /api/admin/ai/knowledge-base/?category=services
    POST /api/admin/ai/knowledge-base/
    {"category": "services", "title": "...", "content": "...", "keywords": [...]}
    """
    kb_service = get_knowledge_base_service()
    
    if request.method == 'GET':
        category = request.query_params.get('category')
        query = request.query_params.get('q')
        
        if query:
            results = kb_service.search(query, category)
        elif category:
            results = kb_service.get_by_category(category)
        else:
            # Get all entries grouped by category
            from .models import KnowledgeBase
            entries = KnowledgeBase.objects.filter(is_active=True).order_by('category', '-priority')
            results = [
                {
                    'id': e.id,
                    'category': e.category,
                    'title': e.title,
                    'content': e.content[:200] + '...' if len(e.content) > 200 else e.content
                }
                for e in entries
            ]
        
        return Response({'entries': results})
    
    elif request.method == 'POST':
        data = request.data
        required = ['category', 'title', 'content']
        
        if not all(data.get(field) for field in required):
            return Response(
                {"error": f"Required fields: {', '.join(required)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = kb_service.add_entry(
            category=data['category'],
            title=data['title'],
            content=data['content'],
            keywords=data.get('keywords', []),
            priority=data.get('priority', 0)
        )
        
        return Response(result, status=status.HTTP_201_CREATED)
