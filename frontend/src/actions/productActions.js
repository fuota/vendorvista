import axios from 'axios'
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_LIST_MY_REQUEST,
    PRODUCT_LIST_MY_SUCCESS,
    PRODUCT_LIST_MY_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
    PRODUCT_REVIEW_REQUEST,
    PRODUCT_REVIEW_SUCCESS,
    PRODUCT_REVIEW_FAIL,
} from '../constants/productConstants'

export const listProducts = (keyword = '', category = '') => async (dispatch) => {
    try {
        dispatch({type: PRODUCT_LIST_REQUEST})
        const params = new URLSearchParams()
        if (keyword) params.set('keyword', keyword)
        if (category) params.set('category', category)
        const query = params.toString()
        const {data} = await axios.get(`/api/products/${query ? `?${query}` : ''}`)
        dispatch({
            type: PRODUCT_LIST_SUCCESS,
            payload: data
        })
    }
    catch (error) {
        dispatch({
            type: PRODUCT_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }

}

export const listProductsDetails = (id) => async (dispatch) => {
    try {
        dispatch({type: PRODUCT_DETAILS_REQUEST})
        const {data} = await axios.get(`/api/products/${id}`)
        dispatch({
            type: PRODUCT_DETAILS_SUCCESS,
            payload: data
        })
    }
    catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }

}

export const listMyProducts = () => async (dispatch, getState) => {
    try {
        dispatch({type: PRODUCT_LIST_MY_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.get('/api/products/myproducts/', config)
        dispatch({type: PRODUCT_LIST_MY_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: PRODUCT_LIST_MY_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const createProduct = (formData) => async (dispatch, getState) => {
    try {
        dispatch({type: PRODUCT_CREATE_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.post('/api/products/create/', formData, config)
        dispatch({type: PRODUCT_CREATE_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: PRODUCT_CREATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const updateProduct = (id, formData) => async (dispatch, getState) => {
    try {
        dispatch({type: PRODUCT_UPDATE_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.put(`/api/products/${id}/update/`, formData, config)
        dispatch({type: PRODUCT_UPDATE_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: PRODUCT_UPDATE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const deleteProductImage = (productId, imageId) => async (dispatch, getState) => {
    const {userLogin: {userInfo}} = getState()
    const config = {
        headers: {
            Authorization: `Bearer ${userInfo.token}`
        }
    }
    try {
        const {data} = await axios.delete(`/api/products/${productId}/images/${imageId}/delete/`, config)
        dispatch({type: PRODUCT_DETAILS_SUCCESS, payload: data})
    }
    catch (error) {
        const message = error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message
        throw new Error(message)
    }
}

export const createProductReview = (productId, rating, comment) => async (dispatch, getState) => {
    try {
        dispatch({type: PRODUCT_REVIEW_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.post(`/api/products/${productId}/reviews/`, {rating, comment}, config)
        dispatch({type: PRODUCT_REVIEW_SUCCESS, payload: data})
    }
    catch (error) {
        const message = error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message
        dispatch({type: PRODUCT_REVIEW_FAIL, payload: message})
        throw new Error(message)
    }
}

export const deleteProduct = (id) => async (dispatch, getState) => {
    try {
        dispatch({type: PRODUCT_DELETE_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        await axios.delete(`/api/products/${id}/delete/`, config)
        dispatch({type: PRODUCT_DELETE_SUCCESS})
    }
    catch (error) {
        dispatch({
            type: PRODUCT_DELETE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}
