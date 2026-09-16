import React, {useState, useEffect} from 'react'
import {Link, useParams, useNavigate} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'
import {Row, Col, Carousel, ListGroup, Card, Button, Form, Badge} from 'react-bootstrap'
import Rating from '../components/Rating'
import Loader from '../components/Loader'
import Message from '../components/Message'
import {useDispatch, useSelector} from 'react-redux'
import {listProductsDetails} from '../actions/productActions'
import {startConversation} from '../actions/chatActions'

function ProductScreen() {
    const [qty, setQty] = useState(1)
    const [messageError, setMessageError] = useState('')
    const navigate = useNavigate();


    const {id} = useParams();
    const dispatch = useDispatch();
    const productDetails = useSelector(state => state.productDetails)
    const {loading, error, product} = productDetails

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        dispatch(listProductsDetails(id))

    }, [dispatch, id])

    const addToCartHandler = () => {
      navigate(`/cart/${id}?qty=${qty}`)
    }

    const messageSellerHandler = async () => {
        if (!userInfo) {
            navigate(`/login?redirect=/product/${id}`)
            return
        }
        try {
            const conversation = await dispatch(startConversation(id))
            navigate(`/chat/${conversation.id}`)
        }
        catch (err) {
            setMessageError(err.message)
        }
    }

    const isOwner = userInfo && product.user === userInfo.id

    const photos = product.images && product.images.length > 0 ? product.images.map((img) => img.url) : (product.image ? [product.image] : [])
    const videos = product.videos || []
    const mediaItems = [
        ...photos.map((src) => ({type: 'image', src})),
        ...videos.map((src) => ({type: 'video', src})),
    ]

  return (
    <div>
      <Link to="/" className='btn btn-light my-3'> Go Back </Link>
      {loading ? <Loader/>
        : error ? <Message variant='danger'>{error}</Message>
        :
        <Row>
            <Col md={6}>
                <div className='bg-light rounded' style={{aspectRatio: '1', maxWidth: '450px', maxHeight: '450px', overflow: 'hidden'}}>
                    <Carousel
                        variant='dark'
                        interval={null}
                        indicators={mediaItems.length > 1}
                        controls={mediaItems.length > 1}
                        className='h-100'
                    >
                        {mediaItems.map((item, index) => (
                            <Carousel.Item key={index} className='h-100'>
                                <div className='d-flex align-items-center justify-content-center h-100'>
                                    {item.type === 'image' ? (
                                        <img src={item.src} alt={`${product.name} ${index + 1}`} style={{maxWidth: '100%', maxHeight: '450px', objectFit: 'contain'}}/>
                                    ) : (
                                        <video src={item.src} controls style={{maxWidth: '100%', maxHeight: '450px'}}/>
                                    )}
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </Col>
            <Col md={3}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h3>{product.name} {product.isSold && <Badge bg='secondary'>Sold</Badge>}</h3>
                        {product.sellerName && (
                            <div className='text-muted d-flex align-items-center' style={{gap: '8px'}}>
                                Sold by <Link to={`/seller/${product.user}`}>{product.sellerName}</Link>
                                {product.sellerRatingCount > 0 && (
                                    <Rating value={product.sellerRating} text={`(${product.sellerRatingCount})`} color='#f8e825' />
                                )}
                            </div>
                        )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Price: ${product.price}
                    </ListGroup.Item>
                    {product.condition && (
                        <ListGroup.Item>
                            Condition: {product.condition}
                        </ListGroup.Item>
                    )}
                    {product.brand && (
                        <ListGroup.Item>
                            Brand: {product.brand}
                        </ListGroup.Item>
                    )}
                    {product.color && (
                        <ListGroup.Item>
                            Color: {product.color}
                        </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                        Description: {product.description}
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={3}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <Row>
                                <Col>
                                    Price:
                                </Col>
                                <Col>
                                    <strong>${product.price}</strong>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Row>
                                <Col>
                                    Status:
                                </Col>
                                <Col>
                                    {product.isSold ? 'Sold' : product.countInStock>0 ? 'In Stock' : 'Out of Stock'}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                        {isOwner ? (
                            <ListGroup.Item>
                                <LinkContainer to={`/product/${id}/edit`}>
                                    <Button className="w-100" variant='primary' type="button">Edit Listing</Button>
                                </LinkContainer>
                            </ListGroup.Item>
                        ) : (
                            <>
                                {!product.isSold && product.countInStock > 0 && (
                                    <ListGroup.Item>
                                        <Row>
                                            <Col>Qty</Col>
                                            <Col>
                                                <Form.Control as='select' value={qty} onChange={(e) => setQty(e.target.value)}>
                                                    {
                                                        [...Array(product.countInStock).keys()].map(x => (
                                                            <option key={x+1} value={x+1}>{x+1}</option>
                                                        ))
                                                    }
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                )}
                                <ListGroup.Item>
                                    <Button onClick = {addToCartHandler} className="w-100" disabled={product.isSold || product.countInStock===0} type="button">Add to Cart</Button>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    {messageError && <Message variant='danger'>{messageError}</Message>}
                                    <Button onClick={messageSellerHandler} variant='outline-secondary' className="w-100" type="button">Message Seller</Button>
                                </ListGroup.Item>
                            </>
                        )}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
        }
    </div>
  )
}

export default ProductScreen
