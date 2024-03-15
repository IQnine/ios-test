import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";


export const get_upcoming_schedules = async (type: number, userTz: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken')
            console.log("token:",token);
            
            let fetchParameter = {
                method: Method.GET,
                // body: JSON.stringify(userTz),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/getMentorScheduleList_v2?type=${type}&time_zone=${userTz}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const add_time_sheet = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken')
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/saveTimesheet`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}