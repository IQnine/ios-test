import { Actions } from "../types/Types";

const initialState = {
    resetInstitute: false,
};

const resetInstitute = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_RESET_INSTITUTE:
            return {
                ...state,
                resetInstitute: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default resetInstitute