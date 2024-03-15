import { View, Text, ToastAndroid, PermissionsAndroid, Linking, BackHandler } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import FastImage from 'react-native-fast-image'
import { Images } from '../../assets/Images'
import { Utils } from '../../common/Utils'
import * as AuthService from '../../services/auth/AuthServices'
import * as ProfileServices from '../../services/prospect/profile/ProfileServices';
import { setUpcomingData } from '../../redux/action/SchedularData';
import * as InstituteServices from '../../services/prospect/institutes/InstituteServices';
import { useDispatch, useSelector } from 'react-redux'
import { setUserInfo } from '../../redux/action/UserAction'
import { setInstituteInfo } from '../../redux/action/InstituteAction'
import { CometChat } from '@cometchat-pro/react-native-chat'
import * as ScheduleServices from '../../services/prospect/scheduler/SchedulerServices';
import { COMETCHAT_CONSTANTS } from '../../CONSTS'
import useBackHandler from '../../navigation/BackHandler'
import moment from 'moment'


type AmbassadorDataList = {
    id: number,
    status: string,
    schedule: {
        time: string,
        schedule_date: string,
        start_time: any,
        end_time: any
    },
    schedule_user_for_mentor: {
        id: number,
        user_detail: {
            profile_image: any,
            first_name: any,
            nationality: {
                id: number,
                nationality: string,
                alpha_2_code: string
            },
            country: {
                id: number,
                name: string,
                sortname: string
            },
            program: {
                id: number,
                name: string,
            },
        }
    },
    additionalFields: {
        nationality: string,
        languages: [{
            id: number,
            name: string,
            short_code: string
        }],
        date_of_birth: string,
        hobbies_and_interests: string,
        pronouns: string
    }
}



const Splash = (props: any) => {
    let token: any = ''
    let user_detail: any = '';
    useEffect(() => {
        getToken();
        getUpcomingScheduleList();
    }, [])

    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [upcomingList, setUpcomingList] = useState<AmbassadorDataList[]>([]);
    const timeZone = moment.tz.guess();


    const getUpcomingScheduleList = async () => {
        setIsLoading(true);
        // let type = 2
        try {
            await ScheduleServices.get_schedules(2, timeZone).then((res: any) => {
                if (res.statusCode == 200) {
                    setUpcomingList(res.data)
                    dispatch(setUpcomingData(res.data))
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }

            })
        }
        catch (error) {
            console.log("erorrrrrrrrrrrrrrrrrrrrr------123------>", error);
            setIsLoading(false);
        }
    }
    const get_colleges = async (id: any) => {
        try {
            let res: any = await InstituteServices.get_colleges_by_id(id);
            if (res.statusCode === 200) {
                let item = {
                    id: id,
                    name: res.data?.[0].name,
                    logo: res.data?.[0].logo
                }
                let dispatch_data = {
                    item: item,
                    college_data: res.data
                }
                Utils.storeData('primaryColor', res.data[0]?.font_color)
                Utils.storeData('collegeData', dispatch_data)
                Utils.storeData('collegeId',item.id)
                // Utils.storeData('prospect_cometchat_uid', o.data.cometchat_uid)
                // Utils.storeData('prospect_userId', res.data.id)
                dispatch(setInstituteInfo(dispatch_data))
                return res
            } else {
                console.log(res.message);
            }
            // })
        } catch (error) {
            console.log("[Get college by id Error]:", error);

        }
    }

    const college_login = async () => {
        let college_id = await Utils.getData('ambassador_college_id')
        let user_details = await Utils.getData('user_details');
        try {
            let send_data = {
                email_mobile: user_details.email,
                college_id: college_id,
                user_role_id: user_details.role_id
            }
            let t: any = await InstituteServices.college_login(send_data);
            if (t.statusCode == 200) {
                return t
            }
        } catch (error) {
            console.log(error);
        }
    }
    const _openAppSetting = useCallback(async () => {
        // Open the custom settings if the app has one
        await Linking.openSettings();
    }, []);

    const CometChatLogin = async (college_id: number) => {
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        try {
            let c: any = await college_login();
            if (c.data?.is_profile_complete == 1) {
                if (c.statusCode == 200) {
                    CometChat.login(c.data?.cometchat_uid, authKey).then(
                        async (user) => {
                            let r: any = await get_colleges(college_id)

                            // let grants = await PermissionsAndroid.request(
                            //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
                            // console.log(grants);
                            // if (grants === 'never_ask_again') {
                            //     _openAppSetting()
                            // } else {
                            // }
                            props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
                        },
                        async (error) => {
                            let r: any = await get_colleges(college_id)
                            let comet_user = new CometChat.User(c.data?.cometchat_uid);
                            let tags: Array<any> = ["ambassadors", `ambassadors-${r.data[0]?.slug}`, r.data[0]?.slug];
                            let n = AuthService.encrypt(c.data?.user_detail?.first_name);
                            comet_user.setName(n)
                            comet_user.setTags(tags);
                            CometChat.createUser(comet_user, authKey).then(
                                user => {
                                    CometChat.login(c.data?.cometchat_uid, authKey).then(
                                        (user) => {
                                            props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
                                        },
                                        (error) => {
                                            console.log('Login failed with exception:', { error });
                                        },
                                    ).catch(err => {
                                        console.log(err);
                                    });
                                }, error => {
                                    console.log("error", error);
                                }
                            ).catch(e => {
                                console.log("Error--------->", e);
                            })

                        },
                    ).catch(err => {
                        console.log("Comet chat Error:", err);
                    });
                }
            } else {
                props.navigation.replace('AuthStack', { screen: 'Login' })
            }
        } catch (error) {
            console.log(error);

        }
    }

    const getToken = async () => {
        try {
            token = await Utils.getData('accessToken')
            user_detail = await Utils.getData('user_details');
            if (token) {
                ProfileServices.get_user_detail().then(async (res: any) => {
                    if (res.statusCode == 200) {
                        let d = {
                            email: res.data.email,
                            role_id: res.data.role_id
                        }
                        dispatch(setUserInfo(d))
                        if (res.data?.role_id == 4) {
                            let { college_id } = res.data
                            let r = await CometChatLogin(college_id);
                        } else if (res.data?.role_id == 5) {
                            let { college_id } = res.data
                            let r = await get_colleges(college_id)
                            props.navigation.replace('ProspectStack', { screen: 'ProsBottomTabsNavigator' })
                        }
                    } else {
                        // props.navigation.replace('AuthStack', { screen: 'Login' })
                        props.navigation.replace('AuthStack', { screen: 'NetworkError' })
                    }
                }).catch(e => {
                    // props.navigation.replace('AuthStack', { screen: 'Login' })
                    props.navigation.replace('AuthStack', { screen: 'NetworkError' })
                })
            } else {
                props.navigation.replace('AuthStack', { screen: 'Login' })
            }
        } catch (e) {
            console.log('Error ------', e)
        }

    }
    return (
        <View className='flex flex-1 justify-center items-center bg-whiteColor'>
            <View className='w-48 h-[130px]'>
                <FastImage source={Images.truleaguelogo} className='w-full h-full' resizeMode='contain' />
            </View>
        </View>
    )
}

export default Splash