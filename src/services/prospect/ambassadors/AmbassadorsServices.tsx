import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";

export const get_ambassadors = async (data: any) => {
    let college_id = await Utils.getData('collegeId')
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/homePageData_v3', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_ambassadors_witout_token = async (send_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                // body: JSON.stringify({
                //     user_type: send_data.user_type,
                //     college_id: college_id,
                //     page_no: 1,
                // }),
                body: JSON.stringify(send_data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/generalHomePageData_v3', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_state_list = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/getstatesofus', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_industry_list = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/getIndustryList', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_course_list = async () => {
    let user_details = await Utils.getData('user_details');
    let college_id = user_details.role_id == 5 ? await Utils.getData('collegeId') : await Utils.getData('ambassador_college_id')
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/constant/getCourseList/' + college_id, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_slot_data = async (mentorId: number, dateTime: any, userTz: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/getMonthlyScheduleAvailability?mentorId=${mentorId}&dateTime=${dateTime}&userTz=${userTz}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_available_slot = async (mentorId: number, dateTime: any, userTz: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/getScheduleAvailability?mentorId=${mentorId}&dateTime=${dateTime}&userTz=${userTz}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const book_time_slot = async (send_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(send_data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/schedule/studentBooking', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_language_list = async () => {
    let college_id = await Utils.getData('collegeId')
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/getLanguageList', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_enrollment_list = async () => {
    let college_id = await Utils.getData('collegeId')
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/constant/getIntendedYearOfEnrollment/' + college_id, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_application_stage = async () => {
    let college_id = await Utils.getData('collegeId')
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/constant/getCollegeApplicationStage/' + college_id, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_area_of_query_list = async () => {
    let token = await Utils.getData('accessToken')
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/constant/getAreaOfQueryList', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const get_country_list = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                // body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/country', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const add_conversation_info = async (send_data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(send_data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/chat/addConversationInfo', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const get_chat_suggestions = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let college_id = await Utils.getData('collegeId')
            let p_id = await Utils.getData('prospect_userId');
            let fetchParameter = {
                method: Method.GET,
                // body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/chat/suggestedQuestionsProspect?college_id=${college_id}&user_id=${p_id}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

