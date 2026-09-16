import React, {useState, useEffect, useRef} from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import {ListGroup, Form, Button, Row, Col, Card, Image} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getConversationMessages, listMyConversations } from '../actions/chatActions'
import { CHAT_MESSAGE_RECEIVED, CHAT_MESSAGES_RESET } from '../constants/chatConstants'

function ChatScreen() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [text, setText] = useState('')
    const wsRef = useRef(null)
    const bottomRef = useRef(null)

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const chatMessages = useSelector(state => state.chatMessages)
    const { loading, error, messages } = chatMessages

    const chatList = useSelector(state => state.chatList)
    const conversation = chatList.conversations.find(c => String(c.id) === String(id))

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
            return
        }

        dispatch(getConversationMessages(id))
        dispatch(listMyConversations())

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsBase = process.env.REACT_APP_WS_URL || `${protocol}://127.0.0.1:8000`
        const ws = new WebSocket(`${wsBase}/ws/chat/${id}/?token=${userInfo.token}`)
        wsRef.current = ws

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data)
            dispatch({type: CHAT_MESSAGE_RECEIVED, payload: message})
        }

        return () => {
            ws.close()
            dispatch({type: CHAT_MESSAGES_RESET})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, navigate, id, userInfo])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    const sendHandler = (e) => {
        e.preventDefault()
        if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        wsRef.current.send(JSON.stringify({text}))
        setText('')
    }

    if (!userInfo) return null

    const otherParty = conversation
        ? (userInfo.id === conversation.buyer.id ? conversation.seller : conversation.buyer)
        : null

    return (
        <div>
            <Link to='/inbox' className='btn btn-light my-3'>Back to Messages</Link>
            <h2>{otherParty ? `Chat with ${otherParty.name}` : 'Chat'}</h2>
            {conversation && conversation.product && (
                <Card className='mb-3'>
                    <Card.Body>
                        <Row className='align-items-center'>
                            <Col xs={3} md={2}>
                                <Image src={conversation.product.image} alt={conversation.product.name} fluid rounded/>
                            </Col>
                            <Col>
                                <Link to={`/product/${conversation.product._id}`}><strong>{conversation.product.name}</strong></Link>
                                <div className='text-muted'>${conversation.product.price}</div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}
            {loading ? <Loader/> : error ? <Message variant='danger'>{error}</Message> : (
                <ListGroup variant='flush' style={{maxHeight: '400px', overflowY: 'auto'}} className='mb-3'>
                    {messages.map((message) => (
                        <ListGroup.Item key={message.id} className={message.sender.id === userInfo.id ? 'text-end' : ''}>
                            <strong>{message.sender.id === userInfo.id ? 'You' : message.sender.name}:</strong> {message.text}
                        </ListGroup.Item>
                    ))}
                    <div ref={bottomRef}/>
                </ListGroup>
            )}
            <Form onSubmit={sendHandler}>
                <Row>
                    <Col>
                        <Form.Control type='text' placeholder='Type a message...' value={text} onChange={(e) => setText(e.target.value)}/>
                    </Col>
                    <Col xs='auto'>
                        <Button type='submit' variant='primary'>Send</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default ChatScreen
