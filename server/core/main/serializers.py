from rest_framework import serializers
from .models import Category, Product, Order, OrderItem, Cart, CartItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


from rest_framework import serializers
from .models import Order, OrderItem, Product

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.StringRelatedField()  # Change this to serialize product details as needed

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # Nested items for order
    user = serializers.ReadOnlyField(source='user.username')  # Make user read-only

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'updated_at', 'status', 'items']
        read_only_fields = ['created_at', 'updated_at', 'status']

    def create(self, validated_data):
        # Extract the user from the request context
        user = self.context['request'].user
        
        # Remove 'user' from validated_data to avoid passing it twice
        validated_data.pop('user', None)
        
        # Create the order
        order = Order.objects.create(user=user, **validated_data)
        
        # Get the user's cart
        cart = Cart.objects.get(user=user)
        
        # Create order items based on cart items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            # Optionally, delete the cart items after creating the order
            cart_item.delete()

        return order


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']
