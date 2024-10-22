import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="mt-5 pt-5">
            <Card className="text-center">
                <Card.Body>
                    <Card.Title>Welcome to My E-Commerce Store!</Card.Title>
                    <Card.Text>
                        Discover our amazing products and enjoy great deals.
                    </Card.Text>
                    <Button variant="primary" href="/products">Shop Now</Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Home;
