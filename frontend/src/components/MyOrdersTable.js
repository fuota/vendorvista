import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import OrderStatusTable from './OrderStatusTable'
import { listMyOrders } from '../actions/orderActions'

function MyOrdersTable() {
    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const orderListMy = useSelector(state => state.orderListMy)
    const { loading, error, orders } = orderListMy

    useEffect(() => {
        if (userInfo) {
            dispatch(listMyOrders())
        }
    }, [dispatch, userInfo])

    return <OrderStatusTable loading={loading} error={error} orders={orders} emptyMessage='You have no orders yet' />
}

export default MyOrdersTable
