import { Actions } from "../types/Types";

const initialState = {
    filterState: [],
    isFilterSet: false,
    filterNational: [],
    filterMajor: [],
    filterValue: {
        state: 0,
        major: 0,
        nationality: 0,
        userType: 0
    }
};

const FilterStateReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case Actions.SET_FILTER_STATES_DATA:
            return {
                ...state,
                filterState: action.payload,
            };
        case Actions.SET_IS_FILTER_SET:
            return {
                ...state,
                isFilterSet: action.payload,
            };
        case Actions.SET_FILTER_NATIONA_DATA:
            return {
                ...state,
                filterNational: action.payload,
            };
        case Actions.SET_FILTER_MAJOR_DATA:
            return {
                ...state,
                filterMajor: action.payload,
            };
        case Actions.SET_FILTER_VALUE:
            return {
                ...state,
                filterValue: action.payload,
            };
        default: {
            return state;
        }
    }
}


export default FilterStateReducer;
