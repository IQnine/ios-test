import { Actions } from "../types/Types"

export const setGoogleInfo = (payload: any) => {
    console.log("payload",payload);
    
    return {
        type: Actions.SET_GOOGLE_INFO,
        payload: payload
    }
}

