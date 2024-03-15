import { Actions } from "../types/Types"

export const setInstituteInfo = (payload: any) => {
    return {
        type: Actions.SET_INSTITUTE_INFO,
        payload: payload
    }
}