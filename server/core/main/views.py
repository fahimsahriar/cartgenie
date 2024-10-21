from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product, Order, Cart, CartItem
from .serializers import ProductSerializer, OrderSerializer, CartSerializer, CartItemSerializer

# Product List and Detail Views
class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class CartDetail(generics.RetrieveAPIView):
    queryset = Cart.objects.all()
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
        print(cart_item.quantity)
        cart_item.quantity += quantity  # Incrementing if it already exists
        print(cart_item.quantity)
        cart_item.save()

        # Decrease the product stock after confirming item is in the cart
        print(product.stock)
        product.stock = product.stock - quantity
        print(product.stock)
        product.save()

        return Response({'message': 'Item added to cart'}, status=status.HTTP_201_CREATED)




class RemoveFromCart(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        cart = Cart.objects.get(user=request.user)
        product_id = request.data.get('product_id')
        cart_item = CartItem.objects.filter(cart=cart, product_id=product_id).first()

        if cart_item:
            # Restore stock before removing item
            cart_item.product.stock += cart_item.quantity
            cart_item.product.save()

            cart_item.delete()

        return Response({'message': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)


# Order Views
class OrderList(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
