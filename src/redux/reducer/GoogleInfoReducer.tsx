import { Actions } from "../types/Types";

const initialState = {
    googleInfo: null,
};

const googleInfoReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_GOOGLE_INFO:
            return {
                ...state,
                googleInfo: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default googleInfoReducer
