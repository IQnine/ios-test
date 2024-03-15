import { Actions } from "../types/Types"

export const setCometChatInfo = (payload: any) => {
    return {
        type: Actions.SET_COMET_CHAT_INFO,
        payload: payload
    }
}

export const setCometChatList = (payload: any) => {
    return {
        type: Actions.SET_COMET_CHAT_LIST,
        payload: payload
    }
}
