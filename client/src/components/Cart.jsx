import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button } from 'react-bootstrap';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCartItems = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                window.location.href = '/login';  // Redirect to login if not authenticated
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/cart/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCartItems(response.data.items); // Accessing the 'items' array from the response
            } catch (err) {
                setError('Failed to fetch cart items.');
            }
        };

        fetchCartItems();
    }, []);

    return (
        <Container className="mt-5">
            <h2>Your Cart</h2>
            {error && <p className="text-danger">{error}</p>}

            {cartItems.length > 0 ? (
                <ListGroup>
                    {cartItems.map((item) => (
                        <ListGroup.Item key={item.id}>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <strong>Product ID: {item.product}</strong>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Total Price: ${item.total_price}</p>
                                </div>
                                <div>
                                    <Button variant="danger">Remove</Button>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </Container>
    );
};

export default Cart;
