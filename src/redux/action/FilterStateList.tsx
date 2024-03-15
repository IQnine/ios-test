import { Actions } from "../types/Types"

export const setFilterStates = (payload: any) => {
    return {
        type: Actions.SET_FILTER_STATES_DATA,
        payload: payload
    }
}

export const setIsFilterSet = (payload: any) => {
    return {
        type: Actions.SET_IS_FILTER_SET,
        payload: payload
    }
}

export const setFilterNational = (payload: any) => {
    return {
        type: Actions.SET_FILTER_NATIONA_DATA,
        payload: payload
    }
}

export const setFilterMajor = (payload: any) => {
    return {
        type: Actions.SET_FILTER_MAJOR_DATA,
        payload: payload
    }
}

export const setFilterValue = (payload: any) => {
    return {
        type: Actions.SET_FILTER_VALUE,
        payload: payload
    }
}
