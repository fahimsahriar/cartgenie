import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Pagination, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const dummyImage = 'https://www.gstatic.com/webp/gallery/1.webp'; // Dummy image URL

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/products/?page=${currentPage}`);
                
                setProducts(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 6)); // 6 items per page
                setNextPage(response.data.next);
                setPrevPage(response.data.previous);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const addToCart = async (product_id) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/login';  // Redirect to login if not authenticated
                return;
            }

            const quantity = 1;
            await axios.post(
                `${apiUrl}/cart/add/`,
                { product_id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Failed to add product to cart:', error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <Container className="product-page">
            <h2 className="text-center my-4">Available Products</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Row>
                        {products.map(product => (
                            <Col md={4} key={product.id} className="mb-4 d-flex align-items-stretch">
                                <Card className="shadow-sm h-100">
                                    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Card.Img
                                            variant="top"
                                            src={product.image ? product.image : dummyImage}
                                            alt={product.name}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title>{product.name}</Card.Title>
                                            <Card.Text>
                                                {product.price ? `$${Number(product.price).toFixed(2)}` : 'Price not available'}
                                            </Card.Text>
                                            <Card.Text>{product.description || 'No description available.'}</Card.Text>
                                        </Card.Body>
                                    </Link>
                                    <Button
                                        variant="primary"
                                        onClick={() => addToCart(product.id)}
                                        className="mt-auto"
                                    >
                                        Add to Cart
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Pagination className="justify-content-center mt-4">
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={!prevPage} />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={!prevPage} />

                        {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={!nextPage} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={!nextPage} />
                    </Pagination>
                </>
            )}
        </Container>
    );
};

export default ProductList;
