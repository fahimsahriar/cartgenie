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

    // Function to handle removing an item from the cart
    const handleRemove = async (id) => {
        const token = localStorage.getItem('token');
        
        try {
            // Making DELETE request to remove the product from cart
            await axios.delete(`${apiUrl}/cart/remove/${id}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // After removing, filter out the removed item from the state
            setCartItems(cartItems.filter(item => item.id !== id));

        } catch (err) {
            setError('Failed to remove item from cart.');
        }
    };

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
                                    <strong>Product Name: {item.product_name}</strong>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Total Price: ${item.total_price}</p>
                                </div>
                                <div>
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleRemove(item.id)} // Remove by product_id
                                    >
                                        Remove
                                    </Button>
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
