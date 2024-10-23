import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const OrderDetail = () => {
    const { orderId } = useParams();  // Get order ID from the URL
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';  // Redirect to login if not authenticated
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/orders/${orderId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrder(response.data);
            } catch (err) {
                setError('Failed to fetch order details.');
            }
        };

        fetchOrder();
    }, [orderId]);

    if (error) {
        return <p className="text-danger">{error}</p>;
    }

    if (!order) {
        return <p>Loading...</p>;
    }

    // Safely calculate total price and handle price if it doesn't exist
    const totalPrice = order.items.reduce((acc, item) => {
        const itemPrice = item.price ? parseFloat(item.price) : 0;  // Convert price to number safely
        return acc + itemPrice * item.quantity;
    }, 0);

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Order Details</h2>

            <Card className="shadow-lg">
                <Card.Header>
                    <h4>Order #{order.id}</h4>
                    <Badge bg={order.status === 'Completed' ? 'success' : 'warning'}>
                        {order.status}
                    </Badge>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-4">
                        <Col md={6}>
                            <h5>Delivery Information</h5>
                            <p><strong>Address:</strong> {order.delivery}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                        </Col>
                        <Col md={6}>
                            <h5>User Information</h5>
                            <p><strong>User:</strong> {order.user}</p>
                            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        </Col>
                    </Row>

                    <h5>Items</h5>
                    <ListGroup>
                        {order.items.length > 0 ? (
                            order.items.map(item => (
                                <ListGroup.Item key={item.product}>
                                    <Row key={item.product}>
                                        <Col md={6}>
                                            <strong>{item.product}</strong>
                                        </Col>
                                        <Col md={3}>
                                            Quantity: {item.quantity}
                                        </Col>
                                        <Col md={3}>
                                            Price: ${item.price ? item.price : 'N/A'}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <p>No items in this order.</p>
                        )}
                    </ListGroup>

                    <div className="mt-4">
                        <h5>Order Summary</h5>
                        <p><strong>Total Items:</strong> {order.items.length}</p>
                        <p><strong>Delivery Charge:</strong> $5.00</p>
                        <p><strong>Total Price:</strong> ${(totalPrice + 5)}</p> {/* Adding delivery charge */}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default OrderDetail;
