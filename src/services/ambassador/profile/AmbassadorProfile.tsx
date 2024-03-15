import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";

export const get_user_detail = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/common/version`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const get_course_list = async () => {
    let college_id = await Utils.getData('ambassador_college_id')
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