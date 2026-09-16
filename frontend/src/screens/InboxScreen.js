import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'
import {ListGroup, Image, Row, Col} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listMyConversations } from '../actions/chatActions'

function InboxScreen() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const chatList = useSelector(state => state.chatList)
    const { loading, error, conversations } = chatList

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
        }
        else {
            dispatch(listMyConversations())
        }
    }, [dispatch, navigate, userInfo])

    return (
        <div>
            <h2>Messages</h2>
            {loading ? (
                <Loader />
            ) : error ? (
                <Message variant='danger'>{error}</Message>
            ) : conversations.length === 0 ? (
                <Message>No conversations yet</Message>
            ) : (
                <ListGroup variant='flush'>
                    {conversations.map((conversation) => {
                        const otherParty = userInfo.id === conversation.buyer.id ? conversation.seller : conversation.buyer
                        return (
                            <LinkContainer key={conversation.id} to={`/chat/${conversation.id}`} style={{cursor: 'pointer'}}>
                                <ListGroup.Item action>
                                    <Row className='align-items-center'>
                                        <Col md={1}>
                                            {conversation.product && (
                                                <Image src={conversation.product.image} alt={conversation.product.name} fluid rounded/>
                                            )}
                                        </Col>
                                        <Col>
                                            <div>
                                                <strong>{otherParty.name}</strong>
                                                {conversation.product && (
                                                    <> — {conversation.product.name}</>
                                                )}
                                            </div>
                                            {conversation.lastMessage && (
                                                <div className='text-muted'>{conversation.lastMessage.text}</div>
                                            )}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            </LinkContainer>
                        )
                    })}
                </ListGroup>
            )}
        </div>
    )
}

export default InboxScreen
