import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {Tabs, Tab} from 'react-bootstrap'
import MyOrdersTable from '../components/MyOrdersTable'
import MySalesTable from '../components/MySalesTable'

function MyOrdersScreen() {
    const navigate = useNavigate()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        }
    }, [navigate, userInfo])

    return (
        <div>
            <h2>My Orders</h2>
            <Tabs defaultActiveKey='purchases' className='mb-3'>
                <Tab eventKey='purchases' title='Purchases'>
                    <MyOrdersTable />
                </Tab>
                <Tab eventKey='sales' title='Sales'>
                    <MySalesTable />
                </Tab>
            </Tabs>
        </div>
    )
}

export default MyOrdersScreen
