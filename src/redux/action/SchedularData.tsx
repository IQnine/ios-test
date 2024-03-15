import { Actions } from "../types/Types"

export const setUpcomingData = (payload: any) => {
    return {
        type: Actions.SET_UPCOMING_SCHEDULES_DATA,
        payload: payload
    }
}

export const setSetSlotData = (payload: any) => {
    return {
        type: Actions.SET_SLOT_DATA,
        payload: payload
    }
}
export const setUpcomingAmbassadorData = (payload: any) => {
    return {
        type: Actions.SET_UPCOMING_DATA_AMBASSADOR,
        payload: payload
    }
}
export const setPastAmbassadorData = (payload: any) => {
    return {
        type: Actions.SET_PAST_DATA_AMBASSADOR,
        payload: payload
    }
}

export const setPastProspectData = (payload: any) => {
    return {
        type: Actions.SET_PAST_PROSPECT_SCHEDULES_DATA,
        payload: payload
    }
}

export const setUpcomingProspectData = (payload: any) => {
    return {
        type: Actions.SET_UPCOMING_PROSPECT_SCHEDULES_DATA,
        payload: payload
    }
}

