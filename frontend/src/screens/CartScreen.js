import React, {useEffect} from 'react'
import {Link, useParams, useNavigate, useLocation, useSearchParams} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {Row, Col, ListGroup, Image, Form, Button, Card, ListGroupItem} from 'react-bootstrap'
import Message from '../components/Message'
import { addToCart, removeFromCart } from '../actions/cartActions'


function CartScreen() {
    const navigate = useNavigate()
    const productId = useParams().id

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const qty = searchParams.get('qty')? Number(searchParams.get('qty')) : 1;

    const dispatch = useDispatch()
    const cart = useSelector(state => state.cart)
    const {cartItems} = cart
    console.log(cartItems)

    useEffect(() => {
        if(productId){
            dispatch(addToCart(productId, qty))
        }
    }, [dispatch, productId, qty])

 

    const checkoutHandler = () => {
        navigate('/login?redirect=/shipping')
    }

    const groupedBySeller = cartItems.reduce((groups, item) => {
        const key = item.seller ?? 'unknown'
        if (!groups[key]) {
            groups[key] = {sellerName: item.sellerName || 'Unknown Seller', items: []}
        }
        groups[key].items.push(item)
        return groups
    }, {})

  return (
    <Row>
        <Col md={8}>
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ?
                <Message>Your Cart is Empty. <Link to="/"> Go Back</Link> </Message>
                : (
                    Object.entries(groupedBySeller).map(([sellerId, group]) => (
                        <div key={sellerId} className='mb-4'>
                            <h5 className='text-muted'>Sold by {group.sellerName}</h5>
                            <ListGroup variant='flush'>
                                {group.items.map(item => (
                                    <ListGroup.Item key={item.product}>
                                        <Row>
                                            <Col md={2}>
                                                <Image src={item.image} alt={item.name} fluid rounded/>
                                            </Col>
                                            <Col md={3}>
                                                <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            </Col>
                                            <Col md={2}>
                                                ${item.price}
                                            </Col>
                                            <Col md={2}>
                                                <Form.Control as='select' value={item.qty} onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}>
                                                    {[...Array(item.countInStock).keys()].map(x => (
                                                        <option key={x+1} value={x+1}>{x+1}</option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                            <Col md={2}>
                                                <Button type='button' variant='light' onClick={() => dispatch(removeFromCart(item.product))}>
                                                    <i className='fas fa-trash'></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    ))
                )
            }
        </Col>
        <Col md={4}>
            <Card>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Subtotal ({cartItems.reduce((acc, item) => acc + Number(item.qty), 0)}) items</h2>
                        ${cartItems.reduce((acc, item) => acc + Number(item.qty)*Number(item.price), 0).toFixed(2)}
                    </ListGroup.Item>
                    <ListGroupItem>
                        <Button type='button' className="w-100" disabled={cartItems.length === 0} onClick={checkoutHandler}>
                            Proceed to Checkout
                        </Button>
                    </ListGroupItem>
                </ListGroup>
            </Card>
        </Col>
    </Row>
  )
}

export default CartScreen
