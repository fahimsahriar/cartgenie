from django.test import TestCase
from main.models import Product, Cart, CartItem, Category
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class CartTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()  # Use Django REST framework's APIClient for testing

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        
        # Obtain token
        response = self.client.post('/api/token/', {'username': 'testuser', 'password': 'password'})
        self.assertEqual(response.status_code, 200)
        token = response.data['access']

        # Set token in the authorization header
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        # Create a category and a product
        self.category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(name="Test Product", price=100, stock=10, category=self.category)
    
    def test_add_to_cart(self):

        # Send request to add a product to the cart
        response = self.client.post('/api/cart/add/', {'product_id': self.product.id, 'quantity': 2})

        # Check if the response is successful (201 Created)
        self.assertEqual(response.status_code, 201)

        # Fetch the cart and cart item to check if quantities and stock are updated correctly
        product = Product.objects.get(name="Test Product")
        cart = Cart.objects.get(user=self.user)
        cart_item = CartItem.objects.get(cart=cart, product=product)

        # Check if the quantity was updated correctly
        self.assertEqual(cart_item.quantity, 2)
        # Verify that the stock is reduced to 8
        self.assertEqual(product.stock, 8)  # Ensure stock is reduced

