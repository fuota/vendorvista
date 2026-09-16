import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Row, Col, Form, Button} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Rating from '../components/Rating'
import Product from '../components/Product'
import Avatar from '../components/Avatar'
import StarPicker from '../components/StarPicker'
import { getSellerProfile, getSellerListings, rateSeller } from '../actions/sellerActions'
import { SELLER_RATE_RESET } from '../constants/sellerConstants'

function SellerProfileScreen() {
    const { id } = useParams()
    const dispatch = useDispatch()

    const [ratingValue, setRatingValue] = useState(0)
    const [comment, setComment] = useState('')
    const [rateError, setRateError] = useState('')

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const sellerProfile = useSelector(state => state.sellerProfile)
    const { loading, error, seller } = sellerProfile

    const sellerListings = useSelector(state => state.sellerListings)
    const { loading: loadingListings, error: errorListings, listings } = sellerListings

    const sellerRate = useSelector(state => state.sellerRate)
    const { loading: loadingRate, success: successRate } = sellerRate

    useEffect(() => {
        dispatch(getSellerProfile(id))
        dispatch(getSellerListings(id))
    }, [dispatch, id])

    useEffect(() => {
        if (successRate) {
            dispatch({type: SELLER_RATE_RESET})
        }
    }, [successRate, dispatch])

    useEffect(() => {
        if (seller && seller.myRating) {
            setRatingValue(seller.myRating.rating)
            setComment(seller.myRating.comment || '')
        }
    }, [seller])

    const isMe = userInfo && seller && userInfo.id === seller.id

    const submitRating = async (e) => {
        e.preventDefault()
        setRateError('')
        if (!ratingValue) {
            setRateError('Please select a star rating')
            return
        }
        try {
            await dispatch(rateSeller(id, ratingValue, comment))
        }
        catch (err) {
            setRateError(err.message)
        }
    }

    if (loading) return <Loader />
    if (error) return <Message variant='danger'>{error}</Message>
    if (!seller) return null

    return (
        <div>
            <Row className='align-items-center mb-4'>
                <Col xs='auto'>
                    <Avatar src={seller.avatar} size={100} />
                </Col>
                <Col>
                    <h2>{seller.name}{isMe && <span className='text-muted'> (You)</span>}</h2>
                    <Rating value={seller.ratingAverage || 0} text={`(${seller.ratingCount} rating${seller.ratingCount === 1 ? '' : 's'})`} color='#f8e825' />
                    <div className='text-muted mt-1'>
                        Member since {new Date(seller.dateJoined).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}
                    </div>
                    <div className='text-muted'>{seller.listingsCount} listing{seller.listingsCount === 1 ? '' : 's'}</div>
                </Col>
            </Row>

            {seller.canRate && (
                <div className='mb-4 p-3 border rounded' style={{maxWidth: '400px'}}>
                    <h5>{seller.myRating ? 'Update your rating' : 'Rate this seller'}</h5>
                    {rateError && <Message variant='danger'>{rateError}</Message>}
                    <Form onSubmit={submitRating}>
                        <StarPicker value={ratingValue} onChange={setRatingValue} />
                        <Form.Control
                            as='textarea'
                            rows={2}
                            className='my-2'
                            placeholder='Optional comment'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button type='submit' variant='primary' disabled={loadingRate}>
                            {seller.myRating ? 'Update Rating' : 'Submit Rating'}
                        </Button>
                    </Form>
                </div>
            )}

            <h3>Listings from {seller.name}</h3>
            {loadingListings ? (
                <Loader />
            ) : errorListings ? (
                <Message variant='danger'>{errorListings}</Message>
            ) : listings.length === 0 ? (
                <Message>No active listings</Message>
            ) : (
                <Row className='g-4'>
                    {listings.map((product) => (
                        <Col key={product._id} sm={12} md={6} lg={4} xl={3} className='d-flex'>
                            <Product product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    )
}

export default SellerProfileScreen
