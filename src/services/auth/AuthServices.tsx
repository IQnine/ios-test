import AsyncStorage from "@react-native-async-storage/async-storage";
import { Utils } from "../../common/Utils";
import { StageURL } from "../../config/Key";
import { ApiVersion } from "../../config/Key";
import { Method } from "../../config/Key";

export const login = async (email: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify({
                    email: email
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/prospect_login', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const ambassador_login = async (email: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify({
                    email: email
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/ambassadors_login', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const get_api = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            // let fetchParameter = {
            //     method: Method.POST,
            //     body: JSON.stringify({
            //         email: email
            //     }),
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json',
            //     },
            // }
            let serverResponse = await fetch('https://api.geoapify.com/v1/ipinfo?apiKey=24482d52460144c2b3384b6178e845c7');
            let response = await serverResponse.json();
            // console.log("apiiiii", response);
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const otp_verification = async (otp: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify({
                    OTP: otp
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'app_token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/prospect_verifyOTP', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const ambassador_otp_verification = async (otp: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify({
                    OTP: otp
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'app_token': token,
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/ambassadors_verifyOTP', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const ambassador_complete_profile = async (body: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'app_token': token,
                    // 'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/signup/mandatory', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const ambassador_complete_profile_fields = async () => {
    return new Promise(async (resolve, reject) => {

        try {
            let token = await Utils.getData('accessToken');
            console.log('token', token);
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/getMentorSignupAttributes', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
export const prospect_complete_profile_fields = async () => {
    return new Promise(async (resolve, reject) => {

        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/get_user_profile', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const propspect_signup_attributes = async (college_id:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/common/getProspectSignupAttributes/${college_id}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const ambassador_complete_profile_additional = async (body: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    // 'app_token': token,
                    // 'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/signup/additional', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const signup = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/prospectsignup', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const updateapptoken = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/updateapptoken', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const create_cometchat_uid = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.POST,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/createCometChatUser', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const comet_chat_email_notification = async (data: any) => {
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
            let serverResponse = await fetch(StageURL.url + 'api/chat/cometChatEmailNotification', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const update_last_message = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.PUT,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/chat/updateConversationLastChat', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const logout = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let fetchParameter = {
                method: Method.GET,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/common/logout', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const decrypt = (message: any) => {
    let shift = 23;
    let decryptedMessage = '';
    let specialValue = '#$^%&*#$';
    if (!message?.includes(specialValue)) {
        return message;
    } else {
        message = message?.replaceAll('#$^%&*#$', '');
        for (let i = 0; i < message?.length; i++) {
            const charCode = message?.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) {
                decryptedMessage += String.fromCharCode(
                    ((charCode - 65 + shift) % 26) + 65
                );
            } else if (charCode >= 97 && charCode <= 122) {
                decryptedMessage += String.fromCharCode(
                    ((charCode - 97 + shift) % 26) + 97
                );
            } else {
                decryptedMessage += message[i];
            }
        }
        return decryptedMessage;
    }
}

export const encrypt = (message: any) => {
    let shift = 3;
    let encryptedMessage = '';
    let specialValue = '#$^%&*#$';
    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i);
        if (charCode >= 65 && charCode <= 90) {
            encryptedMessage += String.fromCharCode(
                ((charCode - 65 + shift) % 26) + 65
            );
        } else if (charCode >= 97 && charCode <= 122) {
            encryptedMessage += String.fromCharCode(
                ((charCode - 97 + shift) % 26) + 97
            );
        } else {
            encryptedMessage += message[i];
        }
    }
    return encryptedMessage + specialValue;
}


export const store_fcm_toke = async (data: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('app_token');
            let fetchParameter = {
                method: Method.PUT,
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
            }
            let serverResponse = await fetch(StageURL.url + 'api/mapp/userFcmNotificationTokenUpdate', fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}


export const profile_data = async (uid: any,timeZone:any) => {
    return new Promise(async (resolve, reject) => {
        try {
            let token = await Utils.getData('accessToken');
            let college_id = await Utils.getData('collegeId');
            let fetchParameter = {
                method: Method.GET,
                // body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'token': token
                },
            }
            let serverResponse = await fetch(StageURL.url + `api/common/get_user_profile_by_comet_chat_id/${uid}?userTz=${timeZone}`, fetchParameter);
            let response = await serverResponse.json();
            resolve(response);
        }
        catch (error) {
            reject(error);
        }
    })
}
