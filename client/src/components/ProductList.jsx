// src/components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [quantity, setQuantity] = useState(1); // Default quantity is 1

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get(`${apiUrl}/products`);
            setProducts(response.data.results);
        };
        fetchProducts();
    }, []);
    // Function to add product to cart
    const addToCart = async (product_id, quantity) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiUrl}/cart/add/`, // Assuming your endpoint is `/cart/add/`
                { product_id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Product added to cart:', response.data);
        } catch (error) {
            console.error('Failed to add product to cart:', error);
        }
    };

    const handleAddToCart = (product_id) => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login if no token found
            window.location.href = '/login';  // Adjust the path to your login page
            return;
        }
        addToCart(product_id, quantity); // Call the addToCart function
    };

    return (
        <Row className="mt-4">
            {products.map(product => (
                <Col md={4} key={product.id} className="mb-4">
                    <Card>
                        <Card.Img variant="top" src={product.image} /> {/* Make sure you have an image field */}
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Card.Text>${product.price}</Card.Text>

                            {/* Input for quantity */}
                            <Form.Group controlId="formQuantity">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    min="1" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)} 
                                />
                            </Form.Group>

                            <Button 
                                variant="primary" 
                                onClick={() => handleAddToCart(product.id)}
                            >
                                Add to Cart
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ProductList;
