import { View, Text, TouchableOpacity, StatusBar, FlatList, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import Modal from "react-native-modal";
import * as InstituteServices from '../../../services/prospect/institutes/InstituteServices';
import * as AuthServices from '../../../services/auth/AuthServices';
import { useDispatch, useSelector } from 'react-redux'
import { Utils } from '../../../common/Utils'
import { setInstituteInfo } from '../../../redux/action/InstituteAction'
import { COMETCHAT_CONSTANTS } from '../../../CONSTS'
import { CometChat } from '@cometchat-pro/react-native-chat'
import { useIsFocused } from '@react-navigation/native'
import messaging from '@react-native-firebase/messaging';
import { setResetInstitute } from '../../../redux/action/ResetInstituteAction'
import { setPastProspectData, setUpcomingData, setUpcomingProspectData } from '../../../redux/action/SchedularData'
import { setFilterMajor, setFilterNational, setFilterStates, setFilterValue, setIsFilterSet } from '../../../redux/action/FilterStateList'

type InstituteData = {
    id: number,
    name: string,
    logo: any
}

const Header = (props: any) => {
    const isFocus = useIsFocused();
    const dispatch = useDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [itemId, setItemId] = useState(props.collegeInfo?.item.id);
    const [collegeLogo, setCollegeLogo] = useState();
    const [collegeName, setCollegeName] = useState('');
    const [collegeList, setCollegeList] = useState<InstituteData[]>([]);
    const [loading, setLoading] = useState(false);

    const userInfo = useSelector((state: any) => {
        return state.userInfoReducer.userInfo
    })
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    useEffect(() => {
        getInstituteData();
        setItemId(props.collegeInfo?.item.id)
    }, [isFocus])


    let primaryColor = instituteInfo.college_data[0].font_color

    const closeModal = () => {
        setModalVisible(false);
        props.navigation.navigate('ProspectStack', { screen: 'ProsBottomTabsNavigator' })
    }

    const getInstituteData = async () => {
        try {
            await InstituteServices.get_institutes().then((res: any) => {
                if (res.statusCode == 200) {
                    setCollegeList(res.data)
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    const get_colleges = async (item: any) => {
        try {
            let t: any = await InstituteServices.get_colleges_by_id(item.id)
            if (t.statusCode == 200) {
                return t
            }
        } catch (error) {
            console.log(error);

        }
    }

    const CometChatLogin = async (res: any, push_notification_data: any, result: any, item: any, colledeData: any) => {
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        let t = {
            state: 0,
            major: 0,
            nationality: 0,
            userType: 0
        }
        CometChat.login(res.data.cometchat_uid, authKey).then(
            async (user) => {
                let response: any = await AuthServices.store_fcm_toke(push_notification_data);
                if (response.statusCode == 202) {
                    console.log(response.message);
                }
                Utils.storeData('accessToken', res.data.accessToken)
                Utils.storeData('prospect_cometchat_uid', res.data.cometchat_uid)
                Utils.storeData('prospect_userId', res.data.id)
                Utils.storeData('primaryColor', result.data[0]?.font_color)
                let dispatch_data = {
                    item: item,
                    college_data: colledeData.data
                }
                dispatch(setInstituteInfo(dispatch_data))
                dispatch(setResetInstitute(true))
                dispatch(setPastProspectData([]))
                dispatch(setUpcomingProspectData([]))
                dispatch(setUpcomingData([]))
                dispatch(setFilterValue(t))
                dispatch(setFilterMajor([]))
                dispatch(setFilterNational([]))
                dispatch(setFilterStates([]))
                dispatch(setIsFilterSet(false));
                setItemId(item.id);
                setLoading(false);
                closeModal();
            },
            (error) => {
                let comet_user = new CometChat.User(res.data.cometchat_uid);
                let tags: Array<any> = ["prospect", `prospect-${result.data[0]?.slug}`, result.data[0]?.slug];
                let n = AuthServices.encrypt(res.data.user_detail?.first_name)
                comet_user.setName(n)
                comet_user.setTags(tags);
                CometChat.createUser(comet_user, authKey).then(
                    user => {
                        CometChat.login(res.data.cometchat_uid, authKey).then(
                            async (user) => {
                                let response: any = await AuthServices.store_fcm_toke(push_notification_data);
                                if (response.statusCode == 202) {
                                    console.log(response.message);
                                }
                                Utils.storeData('accessToken', res.data.accessToken)
                                Utils.storeData('prospect_cometchat_uid', res.data.cometchat_uid)
                                Utils.storeData('prospect_userId', res.data.id)
                                Utils.storeData('primaryColor', result.data[0]?.font_color)
                                let dispatch_data = {
                                    item: item,
                                    college_data: colledeData.data
                                }

                                dispatch(setInstituteInfo(dispatch_data))
                                dispatch(setResetInstitute(true))
                                dispatch(setPastProspectData([]))
                                dispatch(setUpcomingProspectData([]))
                                dispatch(setUpcomingData([]))
                                dispatch(setFilterValue(t))
                                dispatch(setFilterMajor([]))
                                dispatch(setFilterNational([]))
                                dispatch(setFilterStates([]))
                                dispatch(setIsFilterSet(false));
                                setItemId(item.id);
                                setLoading(false);
                                closeModal()
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


                setLoading(false)
            },
        ).catch(err => {
            console.log(err);
            setLoading(false)
        });
    }

    const CreateCometChatUser = async (res: any, push_notification_data: any, result: any, item: any, colledeData: any) => {
        let s = {
            college_id: item.id,
            cometchat_uid: res.data.cometchat_uid,
            email: res.data.email,
            first_name: res.data?.user_detail?.first_name,
            isMentorProfileComplete: res.data.is_profile_complete,
            last_name: res.data.user_detail.last_name,
            middle_name: res.data.user_detail.middle_name,
            nationality: res.data.user_detail.country,
            profile_image: res.data.user_detail.profile_image,
            role_id: res.data.role_id,
            token: res.data.accessToken,
            user_id: res.data.id
        }
        let t = {
            state: 0,
            major: 0,
            nationality: 0,
            userType: 0
        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        await AuthServices.create_cometchat_uid(s).then((o: any) => {
            let comet_user = new CometChat.User(o.data.cometchat_uid);
            let tags: Array<any> = ["prospect", `prospect-${result.data[0]?.slug}`, result.data[0]?.slug];
            let n = AuthServices.encrypt(res.data.user_detail?.first_name)
            comet_user.setName(n)
            comet_user.setTags(tags);
            CometChat.createUser(comet_user, authKey).then(
                user => {
                    CometChat.login(o.data.cometchat_uid, authKey).then(
                        async (user) => {
                            let response: any = await AuthServices.store_fcm_toke(push_notification_data);
                            if (response.statusCode == 202) {
                                console.log(response.message);
                            }
                            Utils.storeData('accessToken', res.data.accessToken)
                            Utils.storeData('prospect_cometchat_uid', o.data.cometchat_uid)
                            Utils.storeData('prospect_userId', res.data.id)
                            Utils.storeData('primaryColor', result.data[0]?.font_color)
                            let dispatch_data = {
                                item: item,
                                college_data: colledeData.data
                            }
                            dispatch(setInstituteInfo(dispatch_data))
                            dispatch(setResetInstitute(true))
                            dispatch(setPastProspectData([]))
                            dispatch(setUpcomingProspectData([]))
                            dispatch(setUpcomingData([]))
                            dispatch(setFilterValue(t))
                            dispatch(setFilterMajor([]))
                            dispatch(setFilterNational([]))
                            dispatch(setFilterStates([]))
                            dispatch(setIsFilterSet(false));
                            setItemId(item.id);
                            setLoading(false)
                            closeModal()
                        },
                        (error) => {
                            console.log('Login failed with exception:', { error });
                            setLoading(false)
                        },
                    ).catch(err => {
                        console.log(err);
                        setLoading(false)
                    });
                }, error => {
                    console.log("error", error);
                    setLoading(false)
                }
            ).catch(e => {
                console.log("Error--------->", e);
                setLoading(false)
            })

        })
    }

    const handleInstitueClick = async (item: any) => {
        setLoading(true)
        let colledeData: any = await get_colleges(item)
        let fcm_token = await messaging().getToken();

        collegeList.map((o: any) => {
            if (item.id === o.id) {
                setCollegeLogo(o.logo)
                setCollegeName(o.institute_name)
            }
        })
        let user_detail = await Utils.getData('user_details');
        await Utils.storeData('collegeId', item.id)
        let send_data = {
            email_mobile: user_detail.email,
            college_id: item.id,
            user_role_id: user_detail.role_id
        }
        let push_notification_data = {
            email: user_detail.email,
            college_id: item.id,
            fcm_token: fcm_token
        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        try {
            CometChat.getLoggedinUser().then(
                async user => {
                    if (user) {
                        CometChat.logout().then(
                            async (o) => {
                                await InstituteServices.college_login(send_data).then(async (res: any) => {
                                    if (res.statusCode == 200) {
                                        await InstituteServices.get_colleges_by_id(res.data.college_id).then(async (result: any) => {
                                            if (result.statusCode == 200) {
                                                if (res.data.cometchat_uid) {
                                                    let comet_chat_login = CometChatLogin(res, push_notification_data, result, item, colledeData);
                                                } else {
                                                    let t = CreateCometChatUser(res, push_notification_data, result, item, colledeData)
                                                }
                                            }
                                        })
                                    } else {
                                        setLoading(false)
                                    }
                                })
                            }, error => {
                                console.log("Logout failed with exception:", { error });
                                setLoading(false)
                            }
                        );
                    } else {
                        await InstituteServices.college_login(send_data).then(async (res: any) => {
                            if (res.statusCode == 200) {
                                await InstituteServices.get_colleges_by_id(res.data.college_id).then(async (result: any) => {
                                    if (result.statusCode == 200) {
                                        if (res.data.cometchat_uid) {
                                            let comet_chat_login = CometChatLogin(res, push_notification_data, result, item, colledeData);
                                        } else {
                                            let t = CreateCometChatUser(res, push_notification_data, result, item, colledeData)
                                        }
                                    }
                                })
                            } else {
                                setLoading(false)
                            }
                        })
                    }
                }
            )
        } catch (error) {
            console.log(error);
        }

    }

    const header = () => {
        return (
            <View className={`flex flex-row w-full justify-between items-center bg-[${primaryColor}] pl-4 pr-[10px] h-[80px]`} style={{ backgroundColor: primaryColor }}>
                <View className='flex'>
                    <TouchableOpacity className='flex flex-row items-center' onPress={() => { setModalVisible(!modalVisible) }}>
                        <FastImage source={{ uri: instituteInfo?.college_data[0]?.logo }} resizeMode='center' className=' w-[21px] h-[21px]' />
                        <View className='w-[80%] flex flex-row items-center'>
                            <Text numberOfLines={1} className='text-whiteColor text-xl ml-1 font-Helvetica font-bold'>{instituteInfo?.college_data[0]?.name}</Text>
                            <Text className={`text-whiteColor text-[20px] mt-[5px]  ${modalVisible ? 'rotate-90 ml-3' : '-rotate-90 ml-[6px]'}`}>‹</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View className='flex mt-2'>
                    {/* <TouchableOpacity onPress={() => { }}>
                        <FastImage source={Icons.IcNotification} resizeMode='center' className='w-[23px] h-[25px]' />
                    </TouchableOpacity> */}
                    <TouchableOpacity onPress={() => { props.navigation.navigate('Menu'); setModalVisible(false) }}>
                        <FastImage source={Icons.IcHamburger} resizeMode='center' className='w-[40px] h-[40px]' tintColor={'white'} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderInstitute = ({ item }: { item: InstituteData }) => {
        return (
            <View className=' w-full bg-bgGrayColor'>
                <TouchableOpacity
                    onPress={() => handleInstitueClick(item)}
                    className={`flex flex-row border-b-[1px] border-b-fieldGrayColor px-5 rounded-t-[4px] py-3 items-center justify-between bg-bgGrayColor w-[100%]}`}>
                    <View className='flex flex-row  w-[80%] items-center px-3'>
                        <FastImage source={{ uri: item.logo }} resizeMode='center' className='w-[45px] h-[45px]' />
                        <Text className={`text-textColor tracking-[0.44px] leading-[26px] text-[16px] font-Helvetica  ml-4`}>{item.name}</Text>
                    </View>
                    {
                        item.id === itemId ?
                            <View className='w-[15%] flex items-center justify-center'>
                                <View className='flex justify-center items-center bg-primaryColor rounded-full w-[30px] h-[30px]' style={{ backgroundColor: primaryColor }}>
                                    <FastImage source={Icons.IcRight} resizeMode='center' className='w-[14px] h-[10px]' tintColor={Colors.white} />
                                </View>
                            </View>
                            :
                            null
                    }
                </TouchableOpacity>
            </View>
        )
    }

    const AddInstitute = async () => {
        let t = {
            state: 0,
            major: 0,
            nationality: 0,
            userType: 0
        }
        dispatch(setResetInstitute(true))
        props.navigation.navigate('AddInstitute');
        setModalVisible(false)
        dispatch(setPastProspectData([]))
        dispatch(setUpcomingProspectData([]))
        dispatch(setUpcomingData([]))
        dispatch(setFilterValue(t))
        dispatch(setFilterMajor([]))
        dispatch(setFilterNational([]))
        dispatch(setFilterStates([]))
        dispatch(setIsFilterSet(false));
    }

    return (
        <>
            <Modal
                isVisible={modalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                animationIn={'slideInDown'}
                animationOut={'slideOutUp'}
                animationInTiming={1}
                animationOutTiming={1}
                coverScreen={true}
                onBackdropPress={() => setModalVisible(false)}
                style={{
                    margin: 0,
                    flex: 1,
                    justifyContent: 'flex-start'
                }}>
                {header()}
                <View className='w-full bg-bgGrayColor'>
                    {
                        loading ?
                            <View className=' flex justify-center items-center'>
                                <ActivityIndicator size={'large'} color={primaryColor} />
                            </View>
                            :
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={collegeList}
                                renderItem={renderInstitute}
                                keyExtractor={(item: any) => item.id}
                            />
                    }
                </View>
                <View className='w-full px-4 bg-bgGrayColor pb-5 pt-6'>
                    {
                        loading ?
                            <TouchableOpacity disabled className='w-full border-dashed border-[1px] border-sky-500 px-3 py-4 bg-whiteColor flex justify-center items-center opacity-20' style={{}}>
                                <Text className='text-greyBorder text-[16px] font-normal leading-4'>Add new institution</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity className='w-full border-dashed border-[1px] border-sky-500 px-3 py-4 bg-whiteColor flex justify-center items-center' style={{}}
                                onPress={() => {
                                    AddInstitute()
                                }}>
                                <Text className='text-greyBorder text-[16px] font-normal leading-4'>Add new institution</Text>
                            </TouchableOpacity>
                    }
                </View>
            </Modal>

            <StatusBar backgroundColor={primaryColor} />
            {header()}
        </>
    )
}

export default Header