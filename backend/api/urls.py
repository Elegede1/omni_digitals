from django.urls import path
from .views import (
    health_check,
    membership_billing,
    profile,
    quotation,
    request_quotation,
    signin,
    signup,
    chat,
    community,
    dashboard,
)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('membership-billing/', membership_billing, name='membership_billing'),
    path('profile/', profile, name='profile'),
    path('quotation/', quotation, name='quotation'),
    path('request-quotation/', request_quotation, name='request_quotation'),
    path('signin/', signin, name='signin'),
    path('signup/', signup, name='signup'),
    path('chat/', chat, name='chat'),
    path('community/', community, name='community'),
    path('dashboard/', dashboard, name='dashboard'),
]