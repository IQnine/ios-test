import { Utils } from "./common/Utils"

export const COMETCHAT_CONSTANTS = {
    //staging
    // APP_ID: '241639cc23984652',
    // REGION: 'us',
    // AUTH_KEY: 'aeab943b9ec8c4b15c332e5deb0feee5b136e29a',
    // API_KEY: 'c3eae2d479bbdae36a40423528e2bfc658cf8feb',

    // production
    APP_ID: '243298040a731324',
    REGION: 'us',
    AUTH_KEY: '3016abed6617c5b01c7552e65505c5304602efba',
    API_KEY: 'dd050392904b61ae5a5cc7315a5b520de9a39ed8',
}
export const GOOGLE_SIGNIN_CONSTANTS = {
    // WEB_CLIENT_ID:'954402787286-l95s1mr0r0gvkqvf5f22fhd1vj3ln1av.apps.googleusercontent',
    WEB_CLIENT_ID: '482724074596-u11udic09ddjbslqlqsm7t78v07pjm33.apps.googleusercontent.com',
    // ANDROID_CLIENT_ID :'954402787286-vlsfbsbgc45u5pghojvaku15ma1ctlph.apps.googleusercontent.com',
    ANDROID_CLIENT_ID: '482724074596-o7j4lt0qrtkaal949aaqfgq1m92eal6s.apps.googleusercontent.com'
}

export const SUPER_ADMIN_ID = {
//     staging: '00000000t011',//staging
//     name: 'Truleague Support',//staging
//     admin: '0000funiva60'//staging

    // production
    staging:'100000000000',
    name:'Truleague Support',
}

export const TERMS_AND_CONDITIONS = {
    PRIVACY_POLICY: 'https://privacy-policy.truleague.com/',
    TERMS: 'https://terms-of-use.truleague.com/'
}

export const cometchat_feedback_uid = async () => {
    let id = await Utils.getData('cometchat_feedback_uid');    
    return id
}
// export const CLARITY_ID = "k5qd81bagd" //staging

export const CLARITY_ID = "kgjlh9rubf" //production
