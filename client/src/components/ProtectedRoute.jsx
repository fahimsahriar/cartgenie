import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // If no token, redirect to login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children; // If authenticated, render the protected component (e.g., Cart)
};

export default ProtectedRoute;
