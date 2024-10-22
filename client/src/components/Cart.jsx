import React from 'react';
import { Container } from 'react-bootstrap';

const Cart = () => {
    return (
        <Container className="mt-5">
            <h2>Your Cart</h2>
            {/* Add cart items here */}
            <p>Items in your cart will be displayed here.</p>
        </Container>
    );
};

export default Cart;
