import { Actions } from "../types/Types";

const initialState = {
    cometChatInfo: null,
    cometChatList: []
};

const cometchatInfo = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_COMET_CHAT_INFO:
            return {
                ...state,
                cometChatInfo: action.payload,
            };
        case Actions.SET_COMET_CHAT_LIST:
            return {
                ...state,
                cometChatList: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default cometchatInfo
