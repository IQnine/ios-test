import { Utils } from "../../../common/Utils";
import { StageURL } from "../../../config/Key";
import { Method } from "../../../config/Key";

export const get_field_detail = async () => {
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
            let serverResponse = await fetch(StageURL.url + `api/constant/getFieldDetails_v2`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const get_field_detail_v2 = async () => {
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
            let serverResponse = await fetch(StageURL.url + `api/common/get_user_profile`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

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
            let serverResponse = await fetch(StageURL.url + `api/common/get_user_profile`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const get_mandatory_field = async () => {
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
            let serverResponse = await fetch(StageURL.url + `api/common/getMentorCardAttributes`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const update_profile = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/update', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const upload_image = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.PATCH,
                body: data,
                headers: {
                    // 'Accept': 'application/json',
                    // 'Content-Type': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/updateUserProfileImageMod', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const upload_image_prospect_signup = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.PATCH,
                body: data,
                headers: {
                    // 'Accept': 'application/json',
                    // 'Content-Type': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/updateUserProfileImageProspect', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const upload_image_for_link = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.PATCH,
                body: data,
                headers: {
                    // 'Accept': 'application/json',
                    // 'Content-Type': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/updateUserProfileImageProspect', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}