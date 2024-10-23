import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Pagination, Container } from 'react-bootstrap';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const dummyImage = 'https://www.gstatic.com/webp/gallery/1.webp'; // Dummy image URL

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const [totalPages, setTotalPages] = useState(1);   // Total number of pages
    const [loading, setLoading] = useState(false);     // Loading state for better UX

    useEffect(() => {
        const fetchProducts = async (page = 1) => {
            setLoading(true); // Start loading
            try {
                const response = await axios.get(`${apiUrl}/products/?page=${page}`);
                setProducts(response.data.results);
                setTotalPages(response.data.total_pages); // Assuming your API returns total pages
                setCurrentPage(page);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchProducts(currentPage);
    }, [currentPage]);

    // Function to add product to cart with default quantity 1
    const addToCart = async (product_id) => {
        try {
            const token = localStorage.getItem('token');
            const quantity = 1; // Default quantity
            const response = await axios.post(
                `${apiUrl}/cart/add/`,
                { product_id, quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('Product added to cart:', response.data);
        } catch (error) {
            console.error('Failed to add product to cart:', error);
        }
    };

    // Pagination handler
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
                                    <Card.Img
                                        variant="top"
                                        src={product.image ? product.image : dummyImage} // Use dummy image if no image is available
                                        alt={product.name}
                                        style={{ height: '200px', objectFit: 'cover' }} // Consistent image size
                                    />
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title>{product.name}</Card.Title>
                                        <Card.Text>
                                            {product.price ? `$${Number(product.price).toFixed(2)}` : 'Price not available'}
                                        </Card.Text>
                                        <Card.Text>{product.description || 'No description available.'}</Card.Text>
                                        <Button
                                            variant="primary"
                                            onClick={() => addToCart(product.id)}
                                            className="mt-auto"
                                        >
                                            Add to Cart
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination controls */}
                    <Pagination className="justify-content-center mt-4">
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                        {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                                key={index + 1}
                                active={index + 1 === currentPage}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </>
            )}
        </Container>
    );
};

export default ProductList;
