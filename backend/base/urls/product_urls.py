from django.urls import path

from base.views import product_views as views

urlpatterns = [
    path('', views.getProducts, name="products"),
    path('create/', views.createProduct, name='product-create'),
    path('myproducts/', views.getMyListings, name='my-products'),
    path('<str:pk>/', views.getProduct, name="product"),
    path('<str:pk>/update/', views.updateProduct, name='product-update'),
    path('<str:pk>/images/<str:image_id>/delete/', views.deleteProductImage, name='product-image-delete'),
    path('<str:pk>/reviews/', views.createProductReview, name='product-review'),
    path('<str:pk>/delete/', views.deleteProduct, name='product-delete'),
]
