# tests.py
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

    def test_create_order(self):
        # Log in the user
        self.client.login(username='testuser', password='testpass')

        # Send a request to create an order
        response = self.client.post(reverse('order-list-create'), {})
        
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
