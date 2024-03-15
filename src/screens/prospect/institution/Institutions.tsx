import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, ToastAndroid, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import GradientButton from '../../../components/Gradientbtn'
import LinearGradient from 'react-native-linear-gradient'
import * as InstituteServices from '../../../services/prospect/institutes/InstituteServices'
import * as AuthServices from '../../../services/auth/AuthServices';
import { Utils } from '../../../common/Utils'
import { useDispatch, useSelector } from 'react-redux'
import { setInstituteInfo } from '../../../redux/action/InstituteAction'
import { COMETCHAT_CONSTANTS } from '../../../CONSTS'
import { CometChat } from '@cometchat-pro/react-native-chat'
import messaging from '@react-native-firebase/messaging';

const Institutions = (props: any) => {
    const dispatch = useDispatch();
    type InstituteDataType = {
        id: number,
        name: string,
        logo: any
    }
    const [btnIsVisible, setBtnIsVisible] = useState(false);
    const [instituteData, setInstituteData] = useState<InstituteDataType[]>([]);
    const [collegeId, setcollegeId] = useState(Number);
    const [loading, setLoading] = useState(false)
    const [btnLoading, setBtnLoading] = useState(false);
    const [cometChatUId, setCometChatUId] = useState('');
    const [slug, setSlug] = useState('');

    useEffect(() => {
        getInstituteData();
        // getRoleId();
    }, [])

    const userInfo = useSelector((state: any) => {
        return state.userInfoReducer.userInfo
    })
    //    const getRoleId = ()

    useEffect(() => {
        if (props.navigation.canGoBack()) {
            const backAction = () => {
                props.navigation.goBack()
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                backAction,
            );


            return () => backHandler.remove();
        }
    }, [props.navigation.canGoBack()]);

    const getInstituteData = async () => {
        setLoading(true)
        try {
            await InstituteServices.get_institutes().then((res: any) => {
                if (res.statusCode == 200) {
                    setInstituteData(res.data)
                    setLoading(false)
                }
            })
        } catch (error) {
            console.log(error);
            setLoading(false)
        }
    }
    const get_colleges = async (item: any) => {
        try {
            await InstituteServices.get_colleges_by_id(item.id).then((res: any) => {
                if (res.statusCode === 200) {
                    setSlug(res.data[0]?.slug)
                    let dispatch_data = {
                        item: item,
                        college_data: res.data
                    }
                    Utils.storeData('primaryColor', res.data[0]?.font_color)
                    Utils.storeData('collegeData', dispatch_data)
                    dispatch(setInstituteInfo(dispatch_data))
                } else {
                    console.log(res.message);
                }
            })
        } catch (error) {
            console.log(error);

        }
    }
    const handleInstitueClick = async (item: any) => {
        setBtnIsVisible(true);
        setcollegeId(item.id);
        await Utils.storeData('collegeId', item.id)
        get_colleges(item)
    }

    const handleButtonPress = async () => {
        setBtnLoading(true);
        let college_id
        let user_detail = await Utils.getData('user_details');
        let fcm_token = await messaging().getToken();
        let send_data = {
            email_mobile: user_detail.email,
            college_id: collegeId,
            user_role_id: user_detail.role_id
        }
        let push_notification_data = {
            email: user_detail.email,
            college_id: collegeId,
            fcm_token: fcm_token
        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;

        try {
            await InstituteServices.college_login(send_data).then(async (res: any) => {
                if (res.statusCode == 200) {
                    setCometChatUId(res.data.cometchat_uid)
                    if (res.data.cometchat_uid) {
                        CometChat.login(res.data.cometchat_uid, authKey).then(
                            async (user) => {
                                let response: any = await AuthServices.store_fcm_toke(push_notification_data);
                                if (response.statusCode == 202) {
                                    console.log(response.message);
                                }
                                Utils.storeData('accessToken', res.data.accessToken)
                                Utils.storeData('prospect_cometchat_uid', res.data.cometchat_uid)
                                Utils.storeData('prospect_userId', res.data.id)
                                setBtnLoading(false)
                                props.navigation.replace('ProsBottomTabsNavigator')
                            },
                            (error) => {
                                if (error.code === 'ERR_UID_NOT_FOUND') {
                                    let comet_user = new CometChat.User(res.data.cometchat_uid);
                                    let tags: Array<any> = ["prospect", `prospect-${slug}`, slug];
                                    let n = AuthServices.encrypt(res.data.user_detail?.first_name);
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
                                                    setBtnLoading(false)
                                                    props.navigation.replace('ProsBottomTabsNavigator')
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
                                }
                                setBtnLoading(false)
                            },
                        ).catch(err => {
                            setBtnLoading(false);
                            console.log(err);
                        });
                    } else {
                        await InstituteServices.get_colleges_by_id(collegeId).then(async (p: any) => {
                            if (p.statusCode == 200) {
                                let s = {
                                    college_id: collegeId,
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
                                await AuthServices.create_cometchat_uid(s).then((o: any) => {
                                    let comet_user = new CometChat.User(o.data.cometchat_uid);
                                    let tags: Array<any> = ["prospect", `prospect-${p.data[0]?.slug}`, p.data[0]?.slug];
                                    let n = AuthServices.encrypt(res.data.user_detail?.first_name);
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
                                                    setBtnLoading(false)
                                                    props.navigation.replace('ProsBottomTabsNavigator')
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

                                })
                            }
                        })
                    }
                } else {
                    setBtnLoading(false);
                }
            })
        } catch (error) {
            console.log(error);
            setBtnLoading(false)
        }
    }

    const renderInstitute = ({ item, index }: { item: InstituteDataType, index: any }) => {
        return (
            <TouchableOpacity
                onPress={() => handleInstitueClick(item)}
                className={`flex flex-row border-b-[1px]  border-b-fieldGrayColor  px-5 ${index==0?'rounded-t-[4px]':'rounded-t-[0px]'} py-3 items-center ${btnIsVisible && item.id == collegeId ? 'bg-toggleColor' : 'bg-whiteColor'}`}>
                <View className='w-[45px] h-[45px] rounded-[6px]'>
                    <FastImage source={{ uri: item.logo }} className='w-full h-full rounded-[6px]' resizeMode='contain' />
                </View>
                <View className='border-2 w-[90%] border-transparent'>

                <Text className={`${btnIsVisible && item.id == collegeId ? 'text-whiteColor' : 'text-textColor'} text-[16px] font-normal ml-4 font-Helvetica`}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View className='flex flex-1 px-5 bg-fieldGrayColor'>
            {/* <StatusBar backgroundColor={Colors.fieldGrayColor} /> */}
            <View className='flex flex-row justify-between items-center mt-10 w-full'>
                <View className='w-[70%]'>
                    <Text className='text-textColor text-[25px]  font-normal font-Helvetica'>Select institution</Text>
                </View>
                {
                    instituteData.length > 0 ?
                        <TouchableOpacity
                            onPress={() => { props.navigation.navigate('AddInstitute') }}
                            className='flex flex-row justify-between items-center bg-whiteColor rounded-[4px] border-[1px] border-primaryColor pr-3 pl-1 py-2 w-[30%]'>
                            <View className='w-5 h-5 flex justify-center items-center'>
                                <FastImage source={Icons.IcPlus} tintColor={Colors.primaryColor} className='w-3 h-3' />
                            </View>
                            <View>
                                <Text className='text-primaryColor text-[14px] tracking-[0.44px] leading-5 ml-1 font-InterRegular font-normal'>Add new</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <></>
                }
            </View>

            {
                loading ?
                    <ActivityIndicator size={'large'} color={Colors.textColor} />
                    :
                    instituteData.length > 0 ?
                        <View className='mt-7 bg-whiteColor rounded-[4px] flex flex-auto w-full'>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={instituteData}
                                renderItem={renderInstitute}
                                keyExtractor={(item: any) => item.id}
                            />
                        </View>
                        :
                        <View className='mt-7 bg-greyColor10 rounded-[4px] flex flex-auto w-full mb-7'>
                            <View className='flex flex-1 justify-center items-center flex-col'>
                                <FastImage source={Images.house} className='w-[120px] h-[120px]' />
                                <View className='mt-5'>
                                    <Text className='text-greyBorder text-xl leading-[32px] tracking-[0.15px] font-bold text-center'>
                                        You haven’t signed up with any institution yet
                                    </Text>
                                </View>
                                <View className='mt-5'>
                                    <TouchableOpacity className='' onPress={() => { props.navigation.navigate('AddInstitute') }}>
                                        <LinearGradient
                                            colors={['#1B1869', '#8C126E']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className='px-3 py-4 flex flex-row justify-center items-center rounded-[4px]'>
                                            <FastImage source={Icons.IcPlus} tintColor={Colors.white} className='w-3 h-3' />
                                            <Text className='text-whiteColor font-bold ml-3 text-[16px]'>Add new institution</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
            }

            {
                instituteData.length > 0 ?
                    <View className='flex pb-10 mt-5'>
                        {
                            btnIsVisible ?
                                btnLoading ?
                                    <ActivityIndicator size={'large'} color={Colors.textColor} />
                                    :
                                    <View className=''>
                                        <GradientButton
                                            onPress={handleButtonPress}
                                            text="Select institution"
                                            colors={['#1B1869', '#8C126E']}
                                            disable={false}
                                        />
                                    </View>
                                :
                                <View className='opacity-50'>
                                    <GradientButton
                                        text="Select institution"
                                        colors={['#1B1869', '#8C126E']}
                                        disable={true}
                                    />
                                </View>
                        }
                    </View>
                    :
                    <></>
            }
        </View >
    )
}

export default Institutions