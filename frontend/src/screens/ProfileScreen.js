import React, {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'
import {Form, Button, Row, Col, Tabs, Tab, Modal} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Avatar from '../components/Avatar'
import MyOrdersTable from '../components/MyOrdersTable'
import MySalesTable from '../components/MySalesTable'
import { getUserDetails, updateUserProfile } from '../actions/userActions'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'

function ProfileScreen() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [showAvatarMenu, setShowAvatarMenu] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [pendingPreview, setPendingPreview] = useState(null)
    const [avatarSuccessMsg, setAvatarSuccessMsg] = useState(false)
    const [lastAction, setLastAction] = useState(null)

    const navigate = useNavigate();
    const menuRef = useRef(null)

    const dispatch = useDispatch();
    const userDetails = useSelector(state => state.userDetails);
    const { loading, error, user } = userDetails;

    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;

    const userUpdateProfile = useSelector(state => state.userUpdateProfile);
    const { success, loading: loadingUpdate } = userUpdateProfile;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        }
        else if (!user || !user.name) {
            dispatch(getUserDetails('profile'));
        }
    }, [dispatch, navigate, userInfo, user]);

    useEffect(() => {
        if (success) {
            if (lastAction === 'avatar') {
                setAvatarSuccessMsg(true)
                setPendingFile(null)
            } else {
                setMessage('Password updated')
                setShowPasswordForm(false)
                setPassword('')
                setConfirmPassword('')
            }
            setLastAction(null)
            dispatch({type: USER_UPDATE_PROFILE_RESET})
        }
    }, [success, dispatch, lastAction])

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowAvatarMenu(false)
            }
        }
        document.addEventListener('mousedown', closeMenu)
        return () => document.removeEventListener('mousedown', closeMenu)
    }, [])

    const cancelHandler = () => {
        setShowPasswordForm(false)
        setPassword('')
        setConfirmPassword('')
        setMessage('')
    }

    const submitHandler = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match')
        }
        else{
            setLastAction('password')
            dispatch(updateUserProfile({id: user._id, name: user.name, email: user.email, password}));
        }
    };

    const openUpdateModal = () => {
        setShowAvatarMenu(false)
        setAvatarSuccessMsg(false)
        setPendingFile(null)
        setPendingPreview(null)
        setShowUpdateModal(true)
    }

    const pendingFileHandler = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPendingFile(file)
        setPendingPreview(URL.createObjectURL(file))
    }

    const uploadAvatarHandler = () => {
        if (!pendingFile) return
        setAvatarPreview(pendingPreview)
        setLastAction('avatar')
        dispatch(updateUserProfile({id: user._id, name: user.name, email: user.email, avatar: pendingFile}))
    }

    const currentAvatar = avatarPreview || (user && user.avatar)

  return (
    <>
    <Row>
        <Col md={4}>
            <h2>User Profile</h2>
            {message && <Message variant='danger'>{message}</Message>}
            {error && <Message variant='danger'>{error}</Message>}
            {loading ? (
                <Loader />
            ) : user && (
                <div className='d-flex align-items-start mb-3' style={{gap: '1.25rem'}}>
                    <div ref={menuRef} style={{position: 'relative'}}>
                        <div style={{cursor: 'pointer'}} onClick={() => setShowAvatarMenu(!showAvatarMenu)}>
                            <Avatar src={currentAvatar} size={90} />
                        </div>
                        {showAvatarMenu && (
                            <div
                                className='shadow bg-white rounded border'
                                style={{position: 'absolute', top: '100%', left: 0, zIndex: 20, minWidth: '160px', marginTop: '4px'}}
                            >
                                <Button variant='light' className='w-100 text-start border-0 rounded-0' onClick={() => {setShowAvatarMenu(false); setShowViewModal(true)}}>
                                    View Photo
                                </Button>
                                <Button variant='light' className='w-100 text-start border-0 rounded-0' onClick={openUpdateModal}>
                                    Update Photo
                                </Button>
                            </div>
                        )}
                    </div>
                    <div>
                        <p className='mb-1'><strong>Name: </strong>{user.name}</p>
                        <p className='mb-2'><strong>Email: </strong>{user.email}</p>
                        <LinkContainer to={`/seller/${user._id}`}>
                            <Button variant='outline-secondary' size='sm' className='me-2'>View My Seller Profile</Button>
                        </LinkContainer>
                        {!showPasswordForm && (
                            <Button variant='link' size='sm' onClick={() => setShowPasswordForm(true)}>
                                Change your Password
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {showPasswordForm && (
                <Form onSubmit={submitHandler} className='mt-3'>
                    <Form.Group controlId='password'>
                        <Form.Label>New Password</Form.Label>
                        <Form.Control required type='password' placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group controlId='confirmPassword'>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control required type='password' placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Button type='submit' variant='primary' className='mt-2'>Update Password</Button>{' '}
                    <Button type='button' variant='secondary' className='mt-2' onClick={cancelHandler}>Cancel</Button>
                </Form>
            )}
        </Col>
        <Col md={8}>
            <h2>My Orders</h2>
            <Tabs defaultActiveKey='purchases' className='mb-3'>
                <Tab eventKey='purchases' title='Purchases'>
                    <MyOrdersTable />
                </Tab>
                <Tab eventKey='sales' title='Sales'>
                    <MySalesTable />
                </Tab>
            </Tabs>
        </Col>
    </Row>

    <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
            <Avatar src={currentAvatar} size={220} />
        </Modal.Body>
    </Modal>

    <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
        <Modal.Header closeButton>
            <Modal.Title>Update Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {avatarSuccessMsg && <Message variant='success'>You updated your profile picture successfully</Message>}
            <div className='text-center mb-3'>
                <Avatar src={pendingPreview || currentAvatar} size={150} />
            </div>
            <Form.Group controlId='avatarUpload'>
                <Form.Control type='file' accept='image/*' onChange={pendingFileHandler} />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant='secondary' onClick={() => setShowUpdateModal(false)}>Close</Button>
            <Button variant='primary' disabled={!pendingFile || loadingUpdate} onClick={uploadAvatarHandler}>
                {loadingUpdate ? 'Uploading...' : 'Upload'}
            </Button>
        </Modal.Footer>
    </Modal>
    </>
  )
}

export default ProfileScreen
