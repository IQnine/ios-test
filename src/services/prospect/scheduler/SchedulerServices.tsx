import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";


export const get_schedules = async (type: number, userTz: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                // body: JSON.stringify(userTz),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/schedule/getStudentBookingList_v2?type=${type}&time_zone=${userTz}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}