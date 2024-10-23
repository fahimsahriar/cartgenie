import React, { useEffect, useState } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState(null);
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
                const orders = await axios.get(`${apiUrl}/orders/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setOrders(orders.data);
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
                            <ListGroup.Item key={order.id}>Order ID: {order.id}, Order created at: {order.created_at}, Oder status: {order.status}</ListGroup.Item>
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
