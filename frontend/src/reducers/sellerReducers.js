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
    SELLER_RATE_RESET,
} from '../constants/sellerConstants'

export const sellerProfileReducer = (state = {}, action) => {
    switch (action.type) {
        case SELLER_PROFILE_REQUEST:
            return {loading: true}
        case SELLER_PROFILE_SUCCESS:
            return {loading: false, seller: action.payload}
        case SELLER_PROFILE_FAIL:
            return {loading: false, error: action.payload}
        default:
            return state
    }
}

export const sellerListingsReducer = (state = {listings: []}, action) => {
    switch (action.type) {
        case SELLER_LISTINGS_REQUEST:
            return {loading: true, listings: []}
        case SELLER_LISTINGS_SUCCESS:
            return {loading: false, listings: action.payload}
        case SELLER_LISTINGS_FAIL:
            return {loading: false, error: action.payload}
        default:
            return state
    }
}

export const sellerRateReducer = (state = {}, action) => {
    switch (action.type) {
        case SELLER_RATE_REQUEST:
            return {loading: true}
        case SELLER_RATE_SUCCESS:
            return {loading: false, success: true}
        case SELLER_RATE_FAIL:
            return {loading: false, error: action.payload}
        case SELLER_RATE_RESET:
            return {}
        default:
            return state
    }
}
