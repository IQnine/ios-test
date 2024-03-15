import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";

export const time_difference = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken')
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/constant/getScheduleDifference', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const add_availability = async (data: any) => {
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
            let serverResponse = await fetch(StageURL.url + 'api/schedule/create', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_available_slot_data = async (mentorId: number, userTz: any, dateTime: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken')
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/getScheduleAvailability?mentorId=${mentorId}&userTz=${userTz}&dateTime=${dateTime}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const delete_schedule = async (schedule_id: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken')
            let fetchParameter = {
                method: Method.DELETE,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/deleteBooking?schedule_id=${schedule_id}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
