import { Actions } from "../types/Types"


export const setResetInstitute = (payload: any) => {
    return {
        type: Actions.SET_RESET_INSTITUTE,
        payload: payload
    }
}