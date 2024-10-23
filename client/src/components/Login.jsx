import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
const apiUrl = import.meta.env.VITE_API_URL;

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        // If the user is already authenticated, redirect them to the cart page
        if (localStorage.getItem('token')) {
            navigate('/cart');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${apiUrl}/token/`, { username, password });
            const token = response.data.access; // Assuming your backend returns a token
            localStorage.setItem('token', token); // Store token in local storage
            setAuth(true); // Update auth state
            setUsername('');
            setPassword('');
            // Redirect to cart page after login
            navigate('/cart'); // Redirect user to the cart page
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto">
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h2 className="text-center mb-4">Login</h2>
                            {error && <div className="alert alert-danger text-center">{error}</div>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formUsername" className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formPassword" className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100">
                                    Login
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
