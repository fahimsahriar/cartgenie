import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap'; // Import Button here
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get(`${apiUrl}/products`);
            console.log(response);
            setProducts(response.data.results); // Make sure 'results' is correct based on your API response
        };
        fetchProducts();
    }, []);

    return (
        <Row className="mt-4">
            {products.map(product => (
                <Col md={4} key={product.id} className="mb-4">
                    <Card>
                        <Card.Img variant="top" src={product.image} /> {/* Make sure you have an image field */}
                        <Card.Body>
                            <Card.Title>{product.name}</Card.Title>
                            <Card.Text>${product.price}</Card.Text>
                            <Button variant="primary">Add to Cart</Button> {/* Button is now defined */}
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ProductList;
