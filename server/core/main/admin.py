from django.contrib import admin

from main.models import Cart, CartItem, Category, Order, Product

# Register your models here.
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(Cart)
admin.site.register(CartItem)