import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { ApiVersion } from "../../../config/Key";
import { Method } from "../../../config/Key";

export const get_institutes = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            // console.log("app --token-------->", token);

            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'app_token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/get_colleges', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const code_verification = async (college_code: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify({
                    college_code: college_code
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/collegesVerify', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const college_login = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'token': token,
                    'Authorization': 'Bearer ' + token
                }
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/userCollegeLogin', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_colleges_by_id = async (id: number) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'app_token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/getCollegesById/' + id, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}