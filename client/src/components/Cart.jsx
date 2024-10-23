import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState('');
    const [deliveryCharge, setDeliveryCharge] = useState(5); // Set a default delivery charge
    const [subtotal, setSubtotal] = useState(0);
    const [vat, setVat] = useState(0);
    const [tax, setTax] = useState(0);
    const [total, setTotal] = useState(0);
    const [address, setAddress] = useState('');  // For delivery address
    const [phone, setPhone] = useState('');      // For phone number

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
                calculateTotals(response.data.items);
            } catch (err) {
                setError('Failed to fetch cart items.');
            }
        };

        fetchCartItems();
    }, []);

    const calculateTotals = (items) => {
        const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
        const vat = subtotal * 0.2; // Example: 20% VAT
        const tax = subtotal * 0.1; // Example: 10% tax
        const total = subtotal + vat + tax + deliveryCharge;

        setSubtotal(subtotal);
        setVat(vat);
        setTax(tax);
        setTotal(total);
    };

    const handleQuantityChange = async (id, newQuantity) => {
        const token = localStorage.getItem('token');

        try {
            // Make PUT request to update quantity in cart
            const response = await axios.put(`${apiUrl}/cart/update/${id}/`, { quantity: newQuantity }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update cart items
            const updatedItems = cartItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity, total_price: response.data.total_price } : item
            );

            setCartItems(updatedItems);
            calculateTotals(updatedItems);

        } catch (err) {
            setError('Failed to update item quantity.');
        }
    };

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
            const updatedItems = cartItems.filter(item => item.id !== id);
            setCartItems(updatedItems);
            calculateTotals(updatedItems);

        } catch (err) {
            setError('Failed to remove item from cart.');
        }
    };

    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!address || !phone) {
            setError('Please provide a delivery address and phone number.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            // Post the order to the backend with delivery and phone fields
            const response = await axios.post(`${apiUrl}/orders/create/`, {
                delivery: address,
                phone: phone,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const orderId = response.data.id;  // Assuming the backend returns the created order's ID

            // Clear the cart after successful checkout
            setCartItems([]);
            setError('Order placed successfully!');

            // Redirect to the order detail page
            navigate(`/orders/${orderId}`);  // Navigate to the order detail page with the order ID
        } catch (error) {
            setError('Failed to place the order.');
            console.error(error);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Your Cart</h2>
            {error && <p className="text-danger">{error}</p>}

            {cartItems.length > 0 ? (
                <>
                    <ListGroup>
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item.id}>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <strong>Product Name: {item.product_name}</strong>
                                        <p>
                                            Quantity:
                                            <Form.Control
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                                min="1"
                                                style={{ width: '80px', display: 'inline-block' }}
                                            />
                                        </p>
                                        <p>Total Price: ${item.total_price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    <div className="mt-4">
                        <h4>Summary</h4>
                        <p>Subtotal: ${subtotal.toFixed(2)}</p>
                        <p>VAT (20%): ${vat.toFixed(2)}</p>
                        <p>Tax (10%): ${tax.toFixed(2)}</p>
                        <p>Delivery Charge: ${deliveryCharge.toFixed(2)}</p>
                        <h5>Total: ${total.toFixed(2)}</h5>
                    </div>

                    <div className="mt-4">
                        <h4>Delivery Information</h4>
                        <Form.Group controlId="formAddress">
                            <Form.Label>Delivery Address</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your delivery address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPhone">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" className="mt-3" onClick={handleCheckout}>
                            Checkout
                        </Button>
                    </div>
                </>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </Container>
    );
};

export default Cart;
