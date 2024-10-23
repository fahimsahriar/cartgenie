import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Form } from 'react-bootstrap';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({}); // Store quantities per product

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get(`${apiUrl}/products`);
            setProducts(response.data.results);
            // Initialize quantities for all products
            const initialQuantities = {};
            response.data.results.forEach(product => {
                initialQuantities[product.id] = 1; // Default quantity is 1 for each product
            });
            setQuantities(initialQuantities);
        };
        fetchProducts();
    }, []);

    // Function to add product to cart
    const addToCart = async (product_id) => {
        try {
            const token = localStorage.getItem('token');
            const quantity = quantities[product_id]; // Get the quantity for this specific product

            const response = await axios.post(
                `${apiUrl}/cart/add/`,
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

    // Handle quantity change for a specific product
    const handleQuantityChange = (product_id, newQuantity) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [product_id]: newQuantity, // Update the quantity for this product
        }));
    };

    return (
        <Row className="mt-4">
            {products.map(product => (
                <Col md={4} key={product.id} className="mb-4">
                    <Card>
                        <Card.Img variant="top" src={product.image} />
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Card.Text>${product.price}</Card.Text>

                            {/* Input for quantity for each product */}
                            <Form.Group controlId={`formQuantity-${product.id}`}>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={quantities[product.id]} // Get the quantity for this product
                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                />
                            </Form.Group>

                            <Button 
                                variant="primary" 
                                onClick={() => addToCart(product.id)}
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
