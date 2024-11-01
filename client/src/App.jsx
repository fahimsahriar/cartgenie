import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import OrderDetail from './components/OrderDetail';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'; // Import the CSS file

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    return (
        <Router>
            <div className="app-container">
                {/* Pass isAuthenticated and setIsAuthenticated to the Header */}
                <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/:productId" element={<ProductDetail />} />
                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
                        <Route path="/orders/:orderId" element={<OrderDetail />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
