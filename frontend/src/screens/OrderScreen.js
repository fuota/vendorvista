import React, {useEffect, useState} from 'react'
import { useParams, Link } from 'react-router-dom'
import { ListGroup, Image, Card, Row, Col, Button, Form, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import Message from '../components/Message'
import Loader from '../components/Loader'
import StarPicker from '../components/StarPicker'
import { getOrderDetails, payOrder } from '../actions/orderActions'
import { createProductReview } from '../actions/productActions'
import { ORDER_PAY_RESET } from '../constants/orderConstants'
import { PRODUCT_REVIEW_RESET } from '../constants/productConstants'
import { getOrderStatus } from '../utils/orderStatus'

const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'sb',
    currency: 'USD',
}

function OrderScreen() {
    const { id } = useParams()
    const dispatch = useDispatch()

    const [reviewItem, setReviewItem] = useState(null)
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewComment, setReviewComment] = useState('')
    const [reviewError, setReviewError] = useState('')
    const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false)

    const orderDetails = useSelector(state => state.orderDetails)
    const { order, loading, error } = orderDetails

    const orderPay = useSelector(state => state.orderPay)
    const { loading: loadingPay, success: successPay } = orderPay

    const productReview = useSelector(state => state.productReview)
    const { loading: loadingReview, success: successReview } = productReview

    useEffect(() => {
        if (!order || order._id !== Number(id) || successPay) {
            dispatch({ type: ORDER_PAY_RESET })
            dispatch(getOrderDetails(id))
        }
    }, [dispatch, id, order, successPay])

    useEffect(() => {
        if (successReview) {
            setReviewSuccessMsg(true)
            dispatch({type: PRODUCT_REVIEW_RESET})
        }
    }, [successReview, dispatch])

    const successPaymentHandler = (details) => {
        dispatch(payOrder(id, details))
    }

    const openReviewModal = (item) => {
        setReviewItem(item)
        setReviewRating(0)
        setReviewComment('')
        setReviewError('')
        setReviewSuccessMsg(false)
    }

    const submitReview = async (e) => {
        e.preventDefault()
        setReviewError('')
        if (!reviewRating) {
            setReviewError('Please select a star rating')
            return
        }
        try {
            await dispatch(createProductReview(reviewItem.product, reviewRating, reviewComment))
        }
        catch (err) {
            setReviewError(err.message)
        }
    }

    if (loading || !order) {
        return <Loader />
    }

    if (error) {
        return <Message variant='danger'>{error}</Message>
    }

    const itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    const status = getOrderStatus(order)
    const statusVariant = status === 'Delivered' ? 'success' : status === 'Shipped' ? 'info' : 'warning'

    return (
        <div>
            <h1>Order {order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Status</h2>
                            <Message variant={statusVariant}>{status}</Message>
                        </ListGroup.Item>
                        {order.seller && (
                            <ListGroup.Item>
                                <h2>Seller</h2>
                                <p>
                                    <Link to={`/seller/${order.seller.id}`}>{order.seller.name}</Link>
                                </p>
                                <Link to={`/seller/${order.seller.id}`} className='btn btn-outline-secondary btn-sm'>
                                    Rate Seller
                                </Link>
                            </ListGroup.Item>
                        )}
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong> {order.user.name}</p>
                            <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
                            <p>
                                <strong>Address:</strong>
                                {' '}{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p><strong>Method: </strong>{order.paymentMethod}</p>
                            {order.isPaid ? (
                                <Message variant='success'>Paid on {order.paidAt}</Message>
                            ) : (
                                <Message variant='warning'>Not Paid</Message>
                            )}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {order.orderItems.length === 0 ? <Message>Order is empty</Message> : (
                                <ListGroup variant='flush'>
                                    {order.orderItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row className='align-items-center'>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </Col>
                                                <Col md={3}>
                                                    {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                </Col>
                                                <Col md={3} className='text-end'>
                                                    {order.isPaid && (
                                                        <Button variant='outline-secondary' size='sm' onClick={() => openReviewModal(item)}>
                                                            Rate Product
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            {!order.isPaid && (
                                <ListGroup.Item>
                                    {loadingPay && <Loader />}
                                    <PayPalScriptProvider options={paypalOptions}>
                                        <PayPalButtons
                                            style={{ layout: 'vertical' }}
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [{
                                                        amount: { value: order.totalPrice },
                                                    }],
                                                })
                                            }}
                                            onApprove={(data, actions) => {
                                                return actions.order.capture().then((details) => {
                                                    successPaymentHandler(details)
                                                })
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>

            <Modal show={!!reviewItem} onHide={() => setReviewItem(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Rate {reviewItem && reviewItem.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reviewSuccessMsg && <Message variant='success'>Thanks for your review!</Message>}
                    {reviewError && <Message variant='danger'>{reviewError}</Message>}
                    <Form onSubmit={submitReview}>
                        <StarPicker value={reviewRating} onChange={setReviewRating} />
                        <Form.Control
                            as='textarea'
                            rows={3}
                            className='my-3'
                            placeholder='Optional comment'
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                        />
                        <Button type='submit' variant='primary' disabled={loadingReview}>
                            {loadingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default OrderScreen
