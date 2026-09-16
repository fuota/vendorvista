import {createStore, combineReducers, applyMiddleware} from 'redux'
import {thunk} from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import {productListReducer, productDetailsReducer, productListMyReducer, productCreateReducer, productUpdateReducer, productDeleteReducer, productReviewReducer} from './reducers/productReducers'
import { cartReducer } from './reducers/cartReducers'
import { userLoginReducer, userRegisterReducer, userDetailsReducer, userUpdateProfileReducer } from './reducers/userReducers'
import { orderCreateReducer, orderDetailsReducer, orderPayReducer, orderListMyReducer, orderListSalesReducer } from './reducers/orderReducers'
import { chatStartReducer, chatListReducer, chatMessagesReducer } from './reducers/chatReducers'
import { sellerProfileReducer, sellerListingsReducer, sellerRateReducer } from './reducers/sellerReducers'

const reducer = combineReducers({
    productList: productListReducer,
    productDetails: productDetailsReducer,
    productListMy: productListMyReducer,
    productCreate: productCreateReducer,
    productUpdate: productUpdateReducer,
    productDelete: productDeleteReducer,
    productReview: productReviewReducer,
    cart: cartReducer,
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    userDetails: userDetailsReducer,
    userUpdateProfile: userUpdateProfileReducer,
    orderCreate: orderCreateReducer,
    orderDetails: orderDetailsReducer,
    orderPay: orderPayReducer,
    orderListMy: orderListMyReducer,
    orderListSales: orderListSalesReducer,
    chatStart: chatStartReducer,
    chatList: chatListReducer,
    chatMessages: chatMessagesReducer,
    sellerProfile: sellerProfileReducer,
    sellerListings: sellerListingsReducer,
    sellerRate: sellerRateReducer,
})

const cartItemsfromStorage = localStorage.getItem('cartItems') ? 
                            JSON.parse(localStorage.getItem('cartItems')) : []

const userInfofromStorage = localStorage.getItem('userInfo') ? 
                            JSON.parse(localStorage.getItem('userInfo')) : null

const shippingAddressfromStorage = localStorage.getItem('shippingAddress') ?
                            JSON.parse(localStorage.getItem('shippingAddress')) : {}

const initialState = {
    cart: {
        cartItems: cartItemsfromStorage, 
        shippingAddress: shippingAddressfromStorage
    },
    userLogin: {userInfo: userInfofromStorage},
}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store

