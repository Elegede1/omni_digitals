"""
URL configuration for Omni Assist.
"""
from django.urls import path
from . import views

app_name = 'omni_assist'

urlpatterns = [
    # User-facing chat endpoints
    path('chat/', views.omni_assist_chat, name='chat'),
    path('history/', views.omni_assist_history, name='history'),
    path('close/', views.omni_assist_close_session, name='close_session'),
    
    # Admin AI tools
    path('admin/sessions/', views.admin_ai_sessions, name='admin_sessions'),
    path('admin/sessions/<int:session_id>/', views.admin_session_detail, name='admin_session_detail'),
    path('admin/sessions/<int:session_id>/summarize/', views.admin_summarize_chat, name='admin_summarize'),
    path('admin/sessions/<int:session_id>/draft-reply/', views.admin_draft_reply, name='admin_draft_reply'),
    path('admin/sessions/<int:session_id>/assign/', views.admin_assign_session, name='admin_assign'),
    path('admin/analytics/', views.admin_ai_analytics, name='admin_analytics'),
    
    # Knowledge base management
    path('admin/knowledge-base/', views.admin_knowledge_base, name='admin_kb'),
]
