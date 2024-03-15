import { Actions } from "../types/Types";

const initialState = {
    loginType:false
};
const loginTypeReducer = (state = initialState, action:any) => {
    switch (action.type) {
        case Actions.SET_LOGIN_TYPE:
            return {
                ...state,
                loginType: action.payload,
            };
        default: {
            return state;
        }
    }
}
export default loginTypeReducer