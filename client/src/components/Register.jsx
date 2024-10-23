import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // If the user is already authenticated, redirect them to the cart page
        if (localStorage.getItem('token')) {
            navigate('/cart');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post(`${apiUrl}/register/`, {
                username: username,
                email: email,
                first_name: firstName,
                last_name: lastName,
                password: password,
            });
            setSuccess('Registration successful! You can now log in.');
            setUsername('');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
        } catch (err) {
            console.log(err);
            if (err.response && err.response.data.error) {
                const errorMessages = err.response.data.error;
                setError(errorMessages); // Set the error messages
            } else {
                console.error('An unexpected error occurred:', err);
                setError({ general: 'An unexpected error occurred. Please try again.' });
            }
        }
    };


    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <Row className="w-100">
                <Col md={6} lg={5} className="mx-auto">
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h2 className="text-center mb-4">Create Account</h2>
                            {Object.keys(error).length > 0 && (
                                <div className="error-messages">
                                    {Object.entries(error).map(([field, message]) => (
                                        <p key={field} className="error text-danger">{message}</p>
                                    ))}
                                </div>
                            )}
                            {success && <div className="alert alert-success text-center">{success}</div>}
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

                                <Form.Group controlId="formEmail" className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="formFirstName" className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your first name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formLastName" className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
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
                                    Register
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
