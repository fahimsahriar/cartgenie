from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CategoryListCreateView, ProductListCreateView, ProductDetail, OrderListView, UserRegistrationView
from .views import CartDetail, AddToCart, CartItemDeleteView, OrderCreateView, OrderDetail, UserProfileView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),

    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),

    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),

    path('cart/', CartDetail.as_view(), name='cart-detail'),
    path('cart/add/', AddToCart.as_view(), name='add-to-cart'),
    path('cart/remove/<int:pk>/', CartItemDeleteView.as_view(), name='cart-item-remove'),

    path('orders/', OrderListView.as_view(), name='order-list-create'),
    path('orders/create/', OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),
    

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
]
