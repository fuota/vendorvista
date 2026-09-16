from django.urls import path

from base.views import chat_views as views

urlpatterns = [
    path('start/<str:product_id>/', views.startOrGetConversation, name='chat-start'),
    path('conversations/', views.getMyConversations, name='my-conversations'),
    path('conversations/<str:pk>/messages/', views.getConversationMessages, name='conversation-messages'),
]
