import { Actions } from "../types/Types"

export const setLoginTypeInfo = (payload: any) => {    
    return {
        type: Actions.SET_LOGIN_TYPE,
        payload: payload
    }
}