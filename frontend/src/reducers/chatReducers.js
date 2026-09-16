import {
    CHAT_START_REQUEST,
    CHAT_START_SUCCESS,
    CHAT_START_FAIL,
    CHAT_START_RESET,
    CHAT_LIST_REQUEST,
    CHAT_LIST_SUCCESS,
    CHAT_LIST_FAIL,
    CHAT_MESSAGES_REQUEST,
    CHAT_MESSAGES_SUCCESS,
    CHAT_MESSAGES_FAIL,
    CHAT_MESSAGE_RECEIVED,
    CHAT_MESSAGES_RESET,
} from '../constants/chatConstants'

export const chatStartReducer = (state = {}, action) => {
    switch (action.type) {
        case CHAT_START_REQUEST:
            return {loading: true}
        case CHAT_START_SUCCESS:
            return {loading: false, success: true, conversation: action.payload}
        case CHAT_START_FAIL:
            return {loading: false, error: action.payload}
        case CHAT_START_RESET:
            return {}
        default:
            return state
    }
}

export const chatListReducer = (state = {conversations: []}, action) => {
    switch (action.type) {
        case CHAT_LIST_REQUEST:
            return {loading: true, conversations: []}
        case CHAT_LIST_SUCCESS:
            return {loading: false, conversations: action.payload}
        case CHAT_LIST_FAIL:
            return {loading: false, error: action.payload}
        default:
            return state
    }
}

export const chatMessagesReducer = (state = {messages: []}, action) => {
    switch (action.type) {
        case CHAT_MESSAGES_REQUEST:
            return {loading: true, messages: []}
        case CHAT_MESSAGES_SUCCESS:
            return {loading: false, messages: action.payload}
        case CHAT_MESSAGES_FAIL:
            return {loading: false, error: action.payload}
        case CHAT_MESSAGE_RECEIVED:
            return {...state, messages: [...state.messages, action.payload]}
        case CHAT_MESSAGES_RESET:
            return {messages: []}
        default:
            return state
    }
}
