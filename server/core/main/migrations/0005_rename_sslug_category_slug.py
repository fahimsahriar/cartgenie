# Generated by Django 5.1.2 on 2024-10-21 07:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_remove_cart_products_cart_created_at_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='category',
            old_name='sslug',
            new_name='slug',
        ),
    ]
