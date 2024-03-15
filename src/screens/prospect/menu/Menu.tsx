import { View, Text, TouchableOpacity, BackHandler, TouchableWithoutFeedback, InteractionManager } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../assets/Images'
import { useDispatch, useSelector } from 'react-redux'
import { setUserInfo } from '../../../redux/action/UserAction'
import { CometChat } from '@cometchat-pro/react-native-chat'
import { Utils } from '../../../common/Utils'
import { COMETCHAT_CONSTANTS, SUPER_ADMIN_ID } from '../../../CONSTS'
import * as AuthServices from '../../../services/auth/AuthServices';
import CustomModal from '../../../components/CustomModal'
import { useIsFocused } from '@react-navigation/native'
import MenuFoolter from '../../../components/MenuFoolter'
import { setLoginTypeInfo } from '../../../redux/action/LoginTypeAction'

const Menu = (props: any) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const [prospectChatUid, setProspectChatUid] = useState(Number);
    const [prospectId, setProspectId] = useState(Number);
    const [AwesomeModal, setAwesomeModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);

    const userInfo = useSelector((state: any) => {
        return state.userInfoReducer.userInfo
    })
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })

    let primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        getProspectId()
    }, [isFocused])

    useEffect(() => {
        const backAction = () => {
            props.navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [props.navigation]);

    const getProspectId = async () => {
        let p = await Utils.getData('prospect_cometchat_uid')
        let p_id = await Utils.getData('prospect_userId');
        setProspectChatUid(p);
        setProspectId(p_id);
    }

    const logout = async () => {
        setIsLoading(true)
        try {
            let response: any = await AuthServices.logout();
            if (response.statusCode == 200) {
                CometChat.logout().then(async (o) => {
                    dispatch(setUserInfo(null))
                    await Utils.clearAllData()
                    props.navigation.replace('AuthStack', { screen: 'Login' })
                    setIsLoading(false)
                    setAwesomeModal(false)
                    dispatch(setLoginTypeInfo(false))
                })
            }
        } catch (error) {
            console.error(error);
            setIsLoading(false)
        }
    }

    const tech_support = async () => {
        setBtnDisable(true)
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                apikey: COMETCHAT_CONSTANTS.API_KEY
            }
        };
        try {
            CometChat.getLoggedinUser().then(
                (user: any) => {
                    if (user) {
                        fetch(`https://${COMETCHAT_CONSTANTS.APP_ID}.api-us.cometchat.io/v3/users?searchKey=${SUPER_ADMIN_ID.staging}&perPage=100&page=1`, options)
                            .then(response => response.json())
                            .then(response => {
                                let d = {
                                    blockedByMe: false,
                                    deactivatedAt: 0,
                                    hasBlockedMe: false,
                                    lastActiveAt: response?.data[0]?.lastActiveAt,
                                    name: response?.data[0]?.name,
                                    role: response?.data[0]?.role,
                                    status: response?.data[0]?.status === 'available' ? 'online' : response?.data[0]?.status
                                }
                                props.navigation.navigate('CometChatConversationListWithMessages', { type: 'user', loggedInUser: { ...user, ...d } })
                                setTimeout(() => {
                                    setBtnDisable(false)
                                }, 2000)
                                // InteractionManager.runAfterInteractions(() => {
                                // })
                            })
                            .catch(
                                err => {
                                    console.error("Error while fetching blocked users list:", err)
                                    setBtnDisable(false)
                                }
                            );
                    }
                }, error => {
                    console.log("Something went wrong", error);
                    setBtnDisable(false)
                }
            );
        } catch (error) {
            console.log(error);
            setBtnDisable(false)
        }
    }

    const closeModal = () => {
        setAwesomeModal(false);
    }

    return (
        <View className='flex flex-1 bg-fieldGrayColor'>
            <View className={`flex flex-row items-center px-2 py-5`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={'white'} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-Helvetica ml-1'>{' '}Menu{' '}</Text>
            </View>
            <View className='flex flex-auto'>
                <TouchableOpacity className='flex flex-row border-b-[1px] border-b-greyColor25 px-5 py-6' onPress={() => { props.navigation.navigate('Profile') }}>
                    <FastImage source={Icons.IcUser} resizeMode='center' className='w-[30px] h-[30px]' tintColor={primaryColor} />
                    <Text className='text-textColor text-xl font-Helvetica mt-1 ml-5'>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity className='flex flex-row border-b-[1px] border-b-greyColor25 px-5 py-6' onPress={tech_support} disabled={btnDisable}>
                    <FastImage source={Icons.IcSupportIcon} resizeMode='center' className='w-[30px] h-[30px]' tintColor={primaryColor} />
                    <Text className='text-textColor text-xl font-Helvetica mt-1 ml-5'>Tech Support</Text>
                </TouchableOpacity>
            </View>
            {
                AwesomeModal ?
                    <CustomModal AwesomeModal={AwesomeModal} isLoading={isLoading} no={'Keep me logged in'} yes={'Yes, logout'} title={'Are you leaving?'} onYesClick={logout} message={'Are you sure, you want to logout?'} closeModal={closeModal} />
                    : null
            }

            <MenuFoolter setAwesomeModal={setAwesomeModal} logoutIcon={true} />

        </View>
    )
}

export default Menu

