import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Form, Button, Row, Col} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import FormContainer from '../components/FormContainer'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { createProduct } from '../actions/productActions'
import { PRODUCT_CREATE_RESET, PRODUCT_NAME_MAX_LENGTH } from '../constants/productConstants'
import { CATEGORY_OPTIONS } from '../constants/categories'

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

function CreateListingScreen() {
    const [images, setImages] = useState([])
    const [previews, setPreviews] = useState([])
    const [videos, setVideos] = useState([])
    const [videoPreviews, setVideoPreviews] = useState([])
    const [name, setName] = useState('')
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
    const [condition, setCondition] = useState(CONDITION_OPTIONS[0])
    const [brand, setBrand] = useState('')
    const [color, setColor] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [countInStock, setCountInStock] = useState(1)
    const [formError, setFormError] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const productCreate = useSelector(state => state.productCreate)
    const { loading, error, success, product } = productCreate

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/sell')
        }
    }, [userInfo, navigate])

    useEffect(() => {
        if (success && product) {
            dispatch({type: PRODUCT_CREATE_RESET})
            navigate(`/product/${product._id}`)
        }
    }, [success, product, dispatch, navigate])

    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url))
            videoPreviews.forEach((url) => URL.revokeObjectURL(url))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const imagesHandler = (e) => {
        const files = Array.from(e.target.files)
        setImages(files)
        setPreviews(files.map((file) => URL.createObjectURL(file)))
    }

    const videosHandler = (e) => {
        const files = Array.from(e.target.files)
        setVideos(files)
        setVideoPreviews(files.map((file) => URL.createObjectURL(file)))
    }

    const submitHandler = (e) => {
        e.preventDefault()

        if (images.length === 0) {
            setFormError('Please add at least one photo')
            return
        }
        setFormError('')

        const formData = new FormData()
        formData.append('name', name)
        formData.append('category', category)
        formData.append('condition', condition)
        formData.append('brand', brand)
        formData.append('color', color)
        formData.append('description', description)
        formData.append('price', price)
        formData.append('countInStock', countInStock)
        images.forEach((image) => formData.append('images', image))
        videos.forEach((video) => formData.append('videos', video))

        dispatch(createProduct(formData))
    }

    return (
        <FormContainer>
            <h1>Post a Listing</h1>
            {formError && <Message variant='danger'>{formError}</Message>}
            {error && <Message variant='danger'>{error}</Message>}
            {loading && <Loader />}
            <Form onSubmit={submitHandler}>
                <Form.Group controlId='images' className='mb-3'>
                    <Form.Label>Photos</Form.Label>
                    <Form.Control required type='file' accept='image/*' multiple onChange={imagesHandler} />
                    {previews.length > 0 && (
                        <Row className='mt-2'>
                            {previews.map((src, index) => (
                                <Col xs={4} key={index} className='mb-2'>
                                    <img src={src} alt={`preview ${index}`} style={{width: '100%', objectFit: 'cover', aspectRatio: '1'}} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Form.Group>

                <Form.Group controlId='videos' className='mb-3'>
                    <Form.Label>Videos (optional)</Form.Label>
                    <Form.Control type='file' accept='video/*' multiple onChange={videosHandler} />
                    {videoPreviews.length > 0 && (
                        <Row className='mt-2'>
                            {videoPreviews.map((src, index) => (
                                <Col xs={6} key={index} className='mb-2'>
                                    <video src={src} controls style={{width: '100%'}} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Form.Group>

                <Form.Group controlId='name' className='mb-3'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control required type='text' maxLength={PRODUCT_NAME_MAX_LENGTH} placeholder='e.g. Blue mountain bike' value={name} onChange={(e) => setName(e.target.value)} />
                    <Form.Text className='text-muted'>{name.length}/{PRODUCT_NAME_MAX_LENGTH} characters</Form.Text>
                </Form.Group>

                <Form.Group controlId='category' className='mb-3'>
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {CATEGORY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId='condition' className='mb-3'>
                    <Form.Label>Condition</Form.Label>
                    <Form.Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                        {CONDITION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId='brand' className='mb-3'>
                    <Form.Label>Brand (optional)</Form.Label>
                    <Form.Control type='text' placeholder='e.g. Trek' value={brand} onChange={(e) => setBrand(e.target.value)} />
                </Form.Group>

                <Form.Group controlId='color' className='mb-3'>
                    <Form.Label>Color (optional)</Form.Label>
                    <Form.Control type='text' placeholder='e.g. Blue' value={color} onChange={(e) => setColor(e.target.value)} />
                </Form.Group>

                <Form.Group controlId='description' className='mb-3'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control required as='textarea' rows={4} placeholder='Describe the item, any wear/damage, reason for selling...' value={description} onChange={(e) => setDescription(e.target.value)} />
                </Form.Group>

                <Form.Group controlId='price' className='mb-3'>
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control required type='number' min='0' step='0.01' value={price} onChange={(e) => setPrice(e.target.value)} />
                </Form.Group>

                <Form.Group controlId='countInStock' className='mb-3'>
                    <Form.Label>Quantity available</Form.Label>
                    <Form.Control required type='number' min='1' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} />
                </Form.Group>

                <Button type='submit' variant='primary'>Post Listing</Button>
            </Form>
        </FormContainer>
    )
}

export default CreateListingScreen
