import React, {useState} from 'react'
import { useNavigate, Link} from 'react-router-dom'
import {ListGroup, Image, Card, Row, Col, Button} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import CheckoutSteps from '../components/CheckoutSteps'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { createOrder } from '../actions/orderActions'


function groupBySeller(cartItems) {
    return cartItems.reduce((groups, item) => {
        const key = item.seller ?? 'unknown'
        if (!groups[key]) {
            groups[key] = {sellerName: item.sellerName || 'Unknown Seller', items: []}
        }
        groups[key].items.push(item)
        return groups
    }, {})
}

function computeTotals(items) {
    const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    const shippingPrice = (itemsPrice > 100 ? 0 : 10).toFixed(2)
    const taxPrice = Number((0.075 * itemsPrice).toFixed(2))
    const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2)
    return {itemsPrice, shippingPrice, taxPrice, totalPrice}
}

function PlaceOrderScreen() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [placing, setPlacing] = useState(false)
    const [placeError, setPlaceError] = useState('')

    const cart = useSelector(state => state.cart)
    const sellerGroups = Object.entries(groupBySeller(cart.cartItems)).map(([sellerId, group]) => ({
        sellerId,
        ...group,
        ...computeTotals(group.items),
    }))

    const grandTotal = sellerGroups.reduce((acc, group) => acc + Number(group.totalPrice), 0).toFixed(2)

    const placeOrderHandler = async () => {
        setPlaceError('')
        setPlacing(true)
        try {
            for (const group of sellerGroups) {
                await dispatch(createOrder({
                    orderItems: group.items,
                    shippingAddress: cart.shippingAddress,
                    paymentMethod: cart.paymentMethod,
                    itemsPrice: group.itemsPrice,
                    shippingPrice: group.shippingPrice,
                    taxPrice: group.taxPrice,
                    totalPrice: group.totalPrice,
                }))
            }
            navigate('/myorders')
        }
        catch (err) {
            setPlaceError(err.message)
        }
        finally {
            setPlacing(false)
        }
    }

    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4/>
            {sellerGroups.length > 1 && (
                <Message variant='info'>
                    Your cart has items from {sellerGroups.length} different sellers — this will create {sellerGroups.length} separate orders, each paid individually.
                </Message>
            )}
            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p>
                                <strong>Address:</strong>
                                {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                            </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <strong>Method:</strong>
                            {cart.paymentMethod}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {cart.cartItems.length === 0 ? <Message>Your cart is empty</Message> : (
                                sellerGroups.map((group) => (
                                    <div key={group.sellerId} className='mb-3'>
                                        <h5 className='text-muted'>Sold by {group.sellerName}</h5>
                                        <ListGroup variant='flush'>
                                            {group.items.map((item, index) => (
                                                <ListGroup.Item key={index}>
                                                    <Row>
                                                        <Col md={1}>
                                                            <Image src={item.image} alt={item.name} fluid rounded/>
                                                        </Col>
                                                        <Col>
                                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                        </Col>
                                                        <Col md={4}>
                                                            {item.qty} x ${item.price} = ${item.qty * item.price}
                                                        </Col>
                                                    </Row>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </div>
                                ))
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
                            {sellerGroups.map((group) => (
                                <ListGroup.Item key={group.sellerId}>
                                    <div className='text-muted mb-1'>Sold by {group.sellerName}</div>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>${group.itemsPrice}</Col>
                                    </Row>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>${group.shippingPrice}</Col>
                                    </Row>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col>${group.taxPrice}</Col>
                                    </Row>
                                    <Row>
                                        <Col><strong>Order Total</strong></Col>
                                        <Col><strong>${group.totalPrice}</strong></Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item>
                                <Row>
                                    <Col><strong>Grand Total</strong></Col>
                                    <Col><strong>${grandTotal}</strong></Col>
                                </Row>
                            </ListGroup.Item>
                            {placeError && (
                                <ListGroup.Item>
                                    <Message variant='danger'>{placeError}</Message>
                                </ListGroup.Item>
                            )}
                            {placing && (
                                <ListGroup.Item>
                                    <Loader />
                                </ListGroup.Item>
                            )}
                            <ListGroup.Item>
                                <Button type='button' className='btn-block' disabled={cart.cartItems.length === 0 || placing} onClick={placeOrderHandler}>Place Order</Button>
                            </ListGroup.Item>

                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default PlaceOrderScreen
