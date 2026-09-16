import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'
import {Table, Button, Badge, Row, Col} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listMyProducts, deleteProduct } from '../actions/productActions'

function MyListingsScreen() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const productListMy = useSelector(state => state.productListMy)
    const { loading, error, products } = productListMy

    const productDelete = useSelector(state => state.productDelete)
    const { success: successDelete } = productDelete

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        }
        else {
            dispatch(listMyProducts())
        }
    }, [dispatch, navigate, userInfo, successDelete])

    const deleteHandler = (id) => {
        if (window.confirm('Delete this listing? This cannot be undone.')) {
            dispatch(deleteProduct(id))
        }
    }

    return (
        <div>
            <Row className='align-items-center'>
                <Col><h2>My Listings</h2></Col>
                <Col className='text-end'>
                    <LinkContainer to='/sell'>
                        <Button variant='primary'>+ Post Listing</Button>
                    </LinkContainer>
                </Col>
            </Row>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : products.length === 0 ? (
                <Message>You haven't posted any listings yet</Message>
            ) : (
                <Table striped bordered hover responsive className='table-sm'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td><img src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} /></td>
                                <td>{product.name}</td>
                                <td>${product.price}</td>
                                <td>{product.isSold ? <Badge bg='secondary'>Sold</Badge> : <Badge bg='success'>Active</Badge>}</td>
                                <td>
                                    <LinkContainer to={`/product/${product._id}/edit`}>
                                        <Button variant='light' className='btn-sm me-2'>Edit</Button>
                                    </LinkContainer>
                                    <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(product._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    )
}

export default MyListingsScreen
