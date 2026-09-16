import axios from 'axios'
import {
    CHAT_START_REQUEST,
    CHAT_START_SUCCESS,
    CHAT_START_FAIL,
    CHAT_LIST_REQUEST,
    CHAT_LIST_SUCCESS,
    CHAT_LIST_FAIL,
    CHAT_MESSAGES_REQUEST,
    CHAT_MESSAGES_SUCCESS,
    CHAT_MESSAGES_FAIL,
} from '../constants/chatConstants'

export const startConversation = (productId) => async (dispatch, getState) => {
    try {
        dispatch({type: CHAT_START_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.post(`/api/chat/start/${productId}/`, {}, config)
        dispatch({type: CHAT_START_SUCCESS, payload: data})
        return data
    }
    catch (error) {
        const message = error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message
        dispatch({type: CHAT_START_FAIL, payload: message})
        throw new Error(message)
    }
}

export const listMyConversations = () => async (dispatch, getState) => {
    try {
        dispatch({type: CHAT_LIST_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.get('/api/chat/conversations/', config)
        dispatch({type: CHAT_LIST_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: CHAT_LIST_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}

export const getConversationMessages = (id) => async (dispatch, getState) => {
    try {
        dispatch({type: CHAT_MESSAGES_REQUEST})
        const {userLogin: {userInfo}} = getState()
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        }
        const {data} = await axios.get(`/api/chat/conversations/${id}/messages/`, config)
        dispatch({type: CHAT_MESSAGES_SUCCESS, payload: data})
    }
    catch (error) {
        dispatch({
            type: CHAT_MESSAGES_FAIL,
            payload: error.response && error.response.data.detail
                ? error.response.data.detail
                : error.message
        })
    }
}
