import React, {useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Form, Button, Row, Col} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import FormContainer from '../components/FormContainer'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listProductsDetails, updateProduct, deleteProductImage } from '../actions/productActions'
import { PRODUCT_UPDATE_RESET, PRODUCT_NAME_MAX_LENGTH } from '../constants/productConstants'
import { CATEGORY_OPTIONS } from '../constants/categories'

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

function EditListingScreen() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [newImages, setNewImages] = useState([])
    const [newPreviews, setNewPreviews] = useState([])
    const [newVideos, setNewVideos] = useState([])
    const [newVideoPreviews, setNewVideoPreviews] = useState([])
    const [name, setName] = useState('')
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
    const [condition, setCondition] = useState(CONDITION_OPTIONS[0])
    const [brand, setBrand] = useState('')
    const [color, setColor] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [countInStock, setCountInStock] = useState(1)
    const [loaded, setLoaded] = useState(false)
    const [imageError, setImageError] = useState('')

    const userLogin = useSelector(state => state.userLogin)
    const { userInfo } = userLogin

    const productDetails = useSelector(state => state.productDetails)
    const { loading, error, product } = productDetails

    const productUpdate = useSelector(state => state.productUpdate)
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate

    useEffect(() => {
        if (!userInfo) {
            navigate('/login')
            return
        }
        if (successUpdate) {
            dispatch({type: PRODUCT_UPDATE_RESET})
            navigate(`/product/${id}`)
            return
        }
        if (!product || product._id !== Number(id)) {
            dispatch(listProductsDetails(id))
        } else if (product.user !== userInfo.id) {
            navigate('/mylistings')
        } else if (!loaded) {
            setName(product.name || '')
            setCategory(product.category || CATEGORY_OPTIONS[0])
            setCondition(product.condition || CONDITION_OPTIONS[0])
            setBrand(product.brand || '')
            setColor(product.color || '')
            setDescription(product.description || '')
            setPrice(product.price || '')
            setCountInStock(product.countInStock || 1)
            setLoaded(true)
        }
    }, [dispatch, navigate, userInfo, id, product, successUpdate, loaded])

    const imagesHandler = (e) => {
        const files = Array.from(e.target.files)
        setNewImages(files)
        setNewPreviews(files.map((file) => URL.createObjectURL(file)))
    }

    const removeImageHandler = async (imageId) => {
        setImageError('')
        if (!window.confirm('Remove this photo?')) return
        try {
            await dispatch(deleteProductImage(id, imageId))
        }
        catch (err) {
            setImageError(err.message)
        }
    }

    const videosHandler = (e) => {
        const files = Array.from(e.target.files)
        setNewVideos(files)
        setNewVideoPreviews(files.map((file) => URL.createObjectURL(file)))
    }

    const submitHandler = (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('name', name)
        formData.append('category', category)
        formData.append('condition', condition)
        formData.append('brand', brand)
        formData.append('color', color)
        formData.append('description', description)
        formData.append('price', price)
        formData.append('countInStock', countInStock)
        newImages.forEach((image) => formData.append('images', image))
        newVideos.forEach((video) => formData.append('videos', video))

        dispatch(updateProduct(id, formData))
    }

    return (
        <FormContainer>
            <h1>Edit Listing</h1>
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
            {(loading || loadingUpdate) && <Loader />}
            {error && <Message variant='danger'>{error}</Message>}
            {product && (
                <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3'>
                        <Form.Label>Current Photos</Form.Label>
                        {imageError && <Message variant='danger'>{imageError}</Message>}
                        <Row>
                            {product.images && product.images.length > 0 ? (
                                product.images.map((img) => (
                                    <Col xs={4} key={img.id} className='mb-2 position-relative'>
                                        <img src={img.url} alt={`listing ${img.id}`} style={{width: '100%', objectFit: 'cover', aspectRatio: '1'}} />
                                        {product.images.length > 1 && (
                                            <Button
                                                variant='danger'
                                                size='sm'
                                                className='position-absolute top-0 end-0 m-1'
                                                onClick={() => removeImageHandler(img.id)}
                                            >&times;</Button>
                                        )}
                                    </Col>
                                ))
                            ) : (
                                <Col xs={4} className='mb-2'>
                                    <img src={product.image} alt='listing' style={{width: '100%', objectFit: 'cover', aspectRatio: '1'}} />
                                </Col>
                            )}
                        </Row>
                    </Form.Group>

                    <Form.Group controlId='images' className='mb-3'>
                        <Form.Label>Add More Photos (optional)</Form.Label>
                        <Form.Control type='file' accept='image/*' multiple onChange={imagesHandler} />
                        {newPreviews.length > 0 && (
                            <Row className='mt-2'>
                                {newPreviews.map((src, index) => (
                                    <Col xs={4} key={index} className='mb-2'>
                                        <img src={src} alt={`new preview ${index}`} style={{width: '100%', objectFit: 'cover', aspectRatio: '1'}} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Form.Group>

                    {product.videos && product.videos.length > 0 && (
                        <Form.Group className='mb-3'>
                            <Form.Label>Current Videos</Form.Label>
                            <Row>
                                {product.videos.map((src, index) => (
                                    <Col xs={6} key={index} className='mb-2'>
                                        <video src={src} controls style={{width: '100%'}} />
                                    </Col>
                                ))}
                            </Row>
                        </Form.Group>
                    )}

                    <Form.Group controlId='videos' className='mb-3'>
                        <Form.Label>Add More Videos (optional)</Form.Label>
                        <Form.Control type='file' accept='video/*' multiple onChange={videosHandler} />
                        {newVideoPreviews.length > 0 && (
                            <Row className='mt-2'>
                                {newVideoPreviews.map((src, index) => (
                                    <Col xs={6} key={index} className='mb-2'>
                                        <video src={src} controls style={{width: '100%'}} />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Form.Group>

                    <Form.Group controlId='name' className='mb-3'>
                        <Form.Label>Title</Form.Label>
                        <Form.Control required type='text' maxLength={PRODUCT_NAME_MAX_LENGTH} value={name} onChange={(e) => setName(e.target.value)} />
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
                        <Form.Control type='text' value={brand} onChange={(e) => setBrand(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='color' className='mb-3'>
                        <Form.Label>Color (optional)</Form.Label>
                        <Form.Control type='text' value={color} onChange={(e) => setColor(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='description' className='mb-3'>
                        <Form.Label>Description</Form.Label>
                        <Form.Control required as='textarea' rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='price' className='mb-3'>
                        <Form.Label>Price ($)</Form.Label>
                        <Form.Control required type='number' min='0' step='0.01' value={price} onChange={(e) => setPrice(e.target.value)} />
                    </Form.Group>

                    <Form.Group controlId='countInStock' className='mb-3'>
                        <Form.Label>Quantity available</Form.Label>
                        <Form.Control required type='number' min='0' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} />
                    </Form.Group>

                    <Button type='submit' variant='primary'>Save Changes</Button>
                </Form>
            )}
        </FormContainer>
    )
}

export default EditListingScreen
