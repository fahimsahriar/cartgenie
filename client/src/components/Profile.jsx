import React, { useEffect, useState } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login'; // Redirect to login if not authenticated
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const ordersResponse = await axios.get(`${apiUrl}/orders/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setOrders(ordersResponse.data);
            } catch (err) {
                setError('Failed to fetch user profile.');
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <Container className="mt-5">
            <h2>Your Profile</h2>
            {error && <p className="text-danger">{error}</p>}
            {user ? (
                <>
                    <h3>Username: {user.username}</h3>
                    <h3>Email: {user.email}</h3>

                    <h4>Your Orders:</h4>
                    <ListGroup>
                        {orders.map(order => (
                            <ListGroup.Item key={order.id}>
                                {/* Wrap each order with Link to make it clickable */}
                                <Link to={`/orders/${order.id}`}>
                                    Order ID: {order.id}, Created at: {new Date(order.created_at).toLocaleString()}, Status: {order.status}
                                </Link>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </Container>
    );
};

export default Profile;
