from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Category, Product, Order, OrderItem, Cart, CartItem
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, CartSerializer, CartItemSerializer
from .serializers import UserProfileSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from .serializers import UserRegistrationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from rest_framework.exceptions import NotFound

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            # Simplifying the error response
            simplified_errors = {
                key: value[0] for key, value in e.detail.items()  # Take the first error for each field
            }
            return Response({'error': simplified_errors}, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()

        # Create tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'email': user.email,
            }
        }, status=status.HTTP_201_CREATED)


class CategoryListCreateView(views.APIView):
    permission_classes = [IsAdminUser]  # Only admins can create categories

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if isinstance(request.data, list):  # Check if the data is a list (bulk creation)
            serializer = CategorySerializer(data=request.data, many=True)
        else:  # Single item creation
            serializer = CategorySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Custom pagination for better control
class ProductPagination(PageNumberPagination):
    page_size = 6  # Adjust the page size as needed

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination  # Pagination support
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']  # Search in name and description
    filterset_fields = ['category__name']  # Allow category-based filtering via URL params

    def get_queryset(self):
        queryset = super().get_queryset()

        # Category filter from query parameters
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)

        # Price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset

    def create(self, request, *args, **kwargs):
        # Check if data is a list for bulk creation
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    #permission_classes = [IsAuthenticated]

class CartDetail(generics.RetrieveAPIView):
    #queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class AddToCart(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # Find the product
        product = Product.objects.get(id=product_id)

        # Check if enough stock is available
        if product.stock < quantity:
            return Response({'error': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)

        # Find or create the cart item
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        # Update the cart item quantity
        cart_item.quantity += quantity  # Incrementing if it already exists
        cart_item.save()

        # Decrease the product stock after confirming item is in the cart
        product.stock = product.stock - quantity
        product.save()

        return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)

class CartItemDeleteView(generics.DestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    lookup_field = 'pk'  # Ensure this matches your URL pattern
    Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)

class OrderCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        cart = Cart.objects.get(user=self.request.user)
        
        # Check if the cart is empty
        if not cart.items.exists():
            raise ValidationError("Your cart is empty. Please add items to the cart before placing an order.")
        
        # Calculate total price (optional, not storing this in the database)
        total_price = sum(item.total_price for item in cart.items.all())

        # Get delivery and phone from the request data
        delivery = self.request.data.get('delivery', 'none')
        phone = self.request.data.get('phone', 'none')

        # Create the order with the provided delivery and phone
        order = serializer.save(user=self.request.user, delivery=delivery, phone=phone)

        # Process each cart item into the order
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            item.delete()  # Clear cart items after creating the order
            
        return order

    
class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
