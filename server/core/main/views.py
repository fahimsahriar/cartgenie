from rest_framework import generics, status, views
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Category, Product, Order, Cart, CartItem
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, CartSerializer, CartItemSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

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
    page_size = 10  # Adjust the page size as needed

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
    permission_classes = [IsAuthenticated]

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

# Order Views
class OrderList(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
