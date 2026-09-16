import React from 'react'
import {LinkContainer} from 'react-router-bootstrap'
import {Table, Button} from 'react-bootstrap'
import Message from './Message'
import Loader from './Loader'
import { getOrderStatus } from '../utils/orderStatus'

function OrderStatusTable({loading, error, orders, emptyMessage}) {
    if (loading) return <Loader />
    if (error) return <Message variant='danger'>{error}</Message>
    if (!orders || orders.length === 0) return <Message>{emptyMessage}</Message>

    return (
        <Table striped bordered hover responsive className='table-sm'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.createdAt.substring(0, 10)}</td>
                        <td>${order.totalPrice}</td>
                        <td>{getOrderStatus(order)}</td>
                        <td>
                            <LinkContainer to={`/order/${order._id}`}>
                                <Button className='btn-sm' variant='light'>Details</Button>
                            </LinkContainer>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default OrderStatusTable
