from django.urls import path

from base.views import seller_views as views

urlpatterns = [
    path('<str:pk>/', views.getSellerProfile, name='seller-profile'),
    path('<str:pk>/listings/', views.getSellerListings, name='seller-listings'),
    path('<str:pk>/rate/', views.rateSeller, name='seller-rate'),
]
