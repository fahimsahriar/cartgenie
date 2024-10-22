from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, User, Cart, Product, Order

class OrderTests(APITestCase):
    def setUp(self):
        # Create a user
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        
        # Create a product
        self.product = Product.objects.create(
            category=self.category,
            name='Test Product',
            description='Test Description',
            price=10.00,
            stock=10
        )
        
        # Create a cart and add the product
        self.cart = Cart.objects.create(user=self.user)
        self.cart.items.create(product=self.product, quantity=2)

    def test_create_order_with_items_in_cart(self):
        # Log in the user
        self.client.login(username='testuser', password='testpass')

        # Send a request to create an order
        response = self.client.post(reverse('order-create'), {})
        
        # Check that the response status code is 201 (Created)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the order was created
        order = Order.objects.get(user=self.user)
        
        # Check that order items were created
        self.assertEqual(order.items.count(), 1)  # Check one order item exists
        self.assertEqual(order.items.first().product, self.product)  # Check it matches the product
        self.assertEqual(order.items.first().quantity, 2)  # Check the quantity is correct

        # Check that the product stock has decreased
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)  # Original stock was 10, minus 2 for the order

    def test_create_order_with_empty_cart(self):
        # Log in the user
        self.client.login(username='testuser', password='testpass')

        # Clear the cart
        self.cart.items.all().delete()

        # Send a request to create an order with an empty cart
        response = self.client.post(reverse('order-create'), {})
        
        # Check that the response status code is 400 (Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check that the response contains the correct error message
        self.assertEqual(response.data['detail'], 'Cart is empty. Cannot create order.')  # Ensure the error message matches your logic

    def test_create_order_without_login(self):
        # Send a request to create an order without logging in
        response = self.client.post(reverse('order-create'), {})
        
        # Check that the response status code is 401 (Unauthorized)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_order_creation_with_invalid_user(self):
        # Create a different user
        other_user = User.objects.create_user(username='otheruser', password='otherpass')
        
        # Log in with the other user
        self.client.login(username='otheruser', password='otherpass')

        # Attempt to create an order (should fail since this user has no cart)
        response = self.client.post(reverse('order-create'), {})
        
        # Check that the response status code is 400 (Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
