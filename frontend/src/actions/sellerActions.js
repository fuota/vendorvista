import axios from 'axios'
import {
    SELLER_PROFILE_REQUEST,
    SELLER_PROFILE_SUCCESS,
    SELLER_PROFILE_FAIL,
    SELLER_LISTINGS_REQUEST,
    SELLER_LISTINGS_SUCCESS,
    SELLER_LISTINGS_FAIL,
    SELLER_RATE_REQUEST,
    SELLER_RATE_SUCCESS,
    SELLER_RATE_FAIL,
} from '../constants/sellerConstants'

const authConfig = (getState) => {
    const {userLogin: {userInfo}} = getState()
    return userInfo ? {headers: {Authorization: `Bearer ${userInfo.token}`}} : {}
}

export const getSellerProfile = (id) => async (dispatch, getState) => {
    try {
        dispatch({type: SELLER_PROFILE_REQUEST})
        const {data} = await axios.get(`/api/sellers/${id}/`, authConfig(getState))
        dispatch({type: SELLER_PROFILE_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: SELLER_PROFILE_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const getSellerListings = (id) => async (dispatch) => {
    try {
        dispatch({type: SELLER_LISTINGS_REQUEST})
        const {data} = await axios.get(`/api/sellers/${id}/listings/`)
        dispatch({type: SELLER_LISTINGS_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: SELLER_LISTINGS_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const rateSeller = (id, rating, comment) => async (dispatch, getState) => {
    try {
        dispatch({type: SELLER_RATE_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {headers: {Authorization: `Bearer ${userInfo.token}`}}
        await axios.post(`/api/sellers/${id}/rate/`, {rating, comment}, config)
        dispatch({type: SELLER_RATE_SUCCESS})
        dispatch(getSellerProfile(id))
    }
    catch (error) {
        const message = error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message
        dispatch({type: SELLER_RATE_FAIL, payload: message})
        throw new Error(message)
    }
}
