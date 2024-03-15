import { Actions } from "../types/Types";

const initialState = {
    upcomingData: [],
    slotData: [],
    upcomingAmbassadorData: [],
    pastProspectData: [],
    upcomingProspectData: [],
    pastAmbassadorData: []
};

const upcomingDataReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_UPCOMING_SCHEDULES_DATA:
            return {
                ...state,
                upcomingData: action.payload,
            };
        case Actions.SET_UPCOMING_PROSPECT_SCHEDULES_DATA:
            return {
                ...state,
                upcomingProspectData: action.payload,
            };
        case Actions.SET_PAST_PROSPECT_SCHEDULES_DATA:
            return {
                ...state,
                pastProspectData: action.payload,
            };
        case Actions.SET_SLOT_DATA:
            return {
                ...state,
                slotData: action.payload,
            };
        case Actions.SET_UPCOMING_DATA_AMBASSADOR:
            return {
                ...state,
                upcomingAmbassadorData: action.payload,
            };
        case Actions.SET_PAST_DATA_AMBASSADOR:
            return {
                ...state,
                pastAmbassadorData: action.payload,
            };
        default: {
            return state;
        }
    }
}

export default upcomingDataReducer
