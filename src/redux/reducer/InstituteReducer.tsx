import { Actions } from "../types/Types";

const initialState = {
    instituteInfo: null,
};

const instituteInfoReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_INSTITUTE_INFO:
            return {
                ...state,
                instituteInfo: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default instituteInfoReducer
