import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import OrderStatusTable from './OrderStatusTable'
import { listMySales } from '../actions/orderActions'

function MySalesTable() {
    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const orderListSales = useSelector(state => state.orderListSales)
    const { loading, error, orders } = orderListSales

    useEffect(() => {
        if (userInfo) {
            dispatch(listMySales())
        }
    }, [dispatch, userInfo])

    return <OrderStatusTable loading={loading} error={error} orders={orders} emptyMessage="You haven't sold anything yet" />
}

export default MySalesTable
