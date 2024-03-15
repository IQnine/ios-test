import { combineReducers } from "redux";
import userInfoReducer from "./UserReducer";
import internetReducer from "./InternetReducer";
import instituteInfoReducer from "./InstituteReducer";
import googleInfoReducer from "./GoogleInfoReducer";
import cometchatInfo from "./CometChatReducer";
import upcomingDataReducer from "./upcomingDataReducer";
import FilterStateReducer from "./FilterStateListReducer";
import resetInstitute from "./ResetInstituteReducer";
import loginTypeReducer from "./LoginTypeReducer";
export default combineReducers({
    userInfoReducer,
    internetReducer,
    instituteInfoReducer,
    googleInfoReducer,
    cometchatInfo,
    upcomingDataReducer,
    FilterStateReducer,
    resetInstitute,
    loginTypeReducer
})