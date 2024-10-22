import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const ProductDetail = ({ products }) => {
    const { id } = useParams();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) return <p>Product not found!</p>;

    return (
        <Container className="mt-5">
            <Card>
                <Card.Img variant="top" src={product.image} />
                <Card.Body>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>{product.description}</Card.Text>
                    <Card.Text>${product.price}</Card.Text>
                    <Button variant="primary">Add to Cart</Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductDetail;
