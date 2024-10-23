import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
    const [userFullName, setUserFullName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserProfile = async () => {
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await axios.get(`${apiUrl}/profile/`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        setUserFullName(`${response.data.first_name} ${response.data.last_name}`);
                    } catch (err) {
                        console.error("Error fetching user profile", err);
                    }
                }
            };
            fetchUserProfile();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false); // Update the parent state
        setUserFullName('');
        navigate('/login');
    };

    return (
        <Navbar bg="light" expand="lg" fixed="top">
            <Navbar.Brand as={Link} to="/">My E-Commerce Store</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                    <Nav.Link as={Link} to="/products">Products</Nav.Link>
                    <Nav.Link as={Link} to="/cart">Cart</Nav.Link>

                    {isAuthenticated ? (
                        <>
                            <Nav.Link as={Link} to="/profile">
                                {userFullName ? `Welcome, ${userFullName}` : 'Profile'}
                            </Nav.Link>
                            <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Nav.Link as={Link} to="/register">Register</Nav.Link>
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
