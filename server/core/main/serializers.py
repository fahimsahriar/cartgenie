from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Order, OrderItem, Cart, CartItem
from rest_framework.exceptions import ValidationError

class UserProfileSerializer(serializers.ModelSerializer):
    orders = serializers.PrimaryKeyRelatedField(many=True, queryset=Order.objects.all())

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'orders']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])  # Add password validation
    email = serializers.EmailField(required=True)  # Ensure email is required
    first_name = serializers.CharField(required=True)  # Make first name required
    last_name = serializers.CharField(required=True)   # Make last name required

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'first_name', 'last_name']

    def validate_email(self, value):
        """Ensure the email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """Create a new user with hashed password."""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

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
    product_name = serializers.CharField(source='product.name', read_only=True)  # Fetch product name

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'quantity', 'total_price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']
