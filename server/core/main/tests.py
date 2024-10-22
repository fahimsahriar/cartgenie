from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from main.models import Product, Category

class ProductViewTests(APITestCase):

    def setUp(self):
        # Create sample categories
        self.category1 = Category.objects.create(name='Electronics', slug='electronics')
        self.category2 = Category.objects.create(name='Clothing', slug='clothing')

        # Create sample products
        self.product1 = Product.objects.create(
            name='Smartphone',
            description='Latest smartphone with cool features.',
            price=499.99,
            stock=10,
            category=self.category1
        )
        self.product2 = Product.objects.create(
            name='T-shirt',
            description='Stylish T-shirt for men.',
            price=19.99,
            stock=100,
            category=self.category2
        )

    def test_create_single_product(self):
        url = reverse('product-list-create')
        data = {
            "name": "Laptop",
            "description": "Powerful laptop for gaming.",
            "price": 999.99,
            "stock": 5,
            "category": self.category1.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 3)  # Two initial products, one new

    def test_create_bulk_products(self):
        url = reverse('product-list-create')
        data = [
            {
                "name": "Headphones",
                "description": "Noise-cancelling headphones.",
                "price": 99.99,
                "stock": 30,
                "category": self.category1.id
            },
            {
                "name": "Jeans",
                "description": "Comfortable jeans for all-day wear.",
                "price": 49.99,
                "stock": 50,
                "category": self.category2.id
            }
        ]
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 4)  # Two initial products, two new

    def test_search_products(self):
        url = reverse('product-list-create') + '?search=Smartphone'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # Only one matches 'Smartphone'

    def test_filter_products_by_category(self):
        url = reverse('product-list-create') + f'?category={self.category1.name}'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # Only products in 'Electronics'

    def test_filter_products_by_price_range(self):
        url = reverse('product-list-create') + '?min_price=10&max_price=50'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # One product within this price range

    def test_pagination(self):
        # Assuming ProductPagination has set 1 item per page
        url = reverse('product-list-create') + '?page=1'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # First page has 1 product
