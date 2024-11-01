import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const ProductDetail = () => {
    const { productId } = useParams(); // Get product ID from URL parameters
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/products/${productId}/`);
                setProduct(response.data);
            } catch (err) {
                setError('Failed to load product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const addToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';  // Redirect to login if not authenticated
                return;
            }
            const quantity = 1; // Default quantity for adding to cart
            await axios.post(
                `${apiUrl}/cart/add/`,
                { product_id: product.id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert('Product added to cart!');
        } catch (error) {
            console.error('Failed to add product to cart:', error);
        }
    };

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    <Card.Img
                        variant="top"
                        src={product.image ? product.image : 'https://www.gstatic.com/webp/gallery/1.webp'} // Dummy image if no image provided
                        alt={product.name}
                        style={{ height: '400px', objectFit: 'cover' }}
                    />
                </Col>
                <Col md={6}>
                    <h2>{product.name}</h2>
                    <p><strong>Price:</strong> ${Number(product.price).toFixed(2)}</p>
                    <p><strong>Description:</strong> {product.description || 'No description available.'}</p>
                    <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                    <Button variant="primary" onClick={addToCart}>Add to Cart</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductDetail;
