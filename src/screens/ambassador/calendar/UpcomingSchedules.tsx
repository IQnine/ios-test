import { View, Text, TouchableOpacity, FlatList, Dimensions, ToastAndroid, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image';
import { Icons, Images } from '../../../assets/Images';
import { useDispatch, useSelector } from 'react-redux';
import * as SchedulesServices from '../../../services/ambassador/calendar/Schedules';
import Zocial from 'react-native-vector-icons/Zocial';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../common/Colors';
import { CometChat } from '@cometchat-pro/react-native-chat';
import * as AmbassadorsServices from '../../../services/prospect/ambassadors/AmbassadorsServices';
import { Utils } from '../../../common/Utils';
import { COMETCHAT_CONSTANTS } from '../../../CONSTS';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import { setUpcomingAmbassadorData } from '../../../redux/action/SchedularData';
import { SvgXml } from 'react-native-svg';


type BookingData = {
    id: string,
    schedule: {
        schedule_date: string,
        start_time: any,
        end_time: any,
        time: string
    },
    schedule_user_for_student: {
        user_detail: {
            email: string,
            first_name: string,
            profile_image: any,
            country: {
                id: number,
                name: string,
                sortname: string
            },

        },
        course: {
            id: number,
            name: string
        }
    },
};
const UpcomingSchedules = (props: any) => {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const timeZone = moment.tz.guess();
    const [upcomingData, setUpcomingData] = useState([])
    const [loader, setLoader] = useState(false);
    const [blockList, setBlockList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0].font_color;

    const UPCOMING_DATA: BookingData[] = useSelector((state: any) => {
        return state.upcomingDataReducer?.upcomingAmbassadorData
    })

    useEffect(() => {
        if (isFocused) {
            if (UPCOMING_DATA?.length <= 0) {
                getUpcomingSchedules();
            }
            getBlockedUsers();
        }
    }, [isFocused])

    const getUpcomingSchedules = async () => {
        setLoader(true)
        let type = 2
        try {
            let response: any = await SchedulesServices.get_upcoming_schedules(type, timeZone);
            if (response.statusCode == 200) {
                dispatch(setUpcomingAmbassadorData(response.data))
                setUpcomingData(response.data)
                setLoader(false)
            } else {
                setLoader(false)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getBlockedUsers = async () => {
        try {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    apikey: COMETCHAT_CONSTANTS.API_KEY
                }
            };

            CometChat.getLoggedinUser().then(
                (user: any) => {
                    fetch(`https://${COMETCHAT_CONSTANTS.APP_ID}.api-us.cometchat.io/v3/users/${user.uid}/blockedusers`, options)
                        .then(response => response.json())
                        .then((response: any) => {
                            if (response?.data?.length < 0) {
                            } else {
                                setBlockList(response?.data)
                            }
                        })
                        .catch(
                            err => console.error("Error while fetching blocked users list:", err)
                        );
                }
            );
        } catch (error) {
            console.log("Error:", error);
        }
    }

    const itemClicked = async (item: any) => {
        setBtnDisable(true)
        let p = await Utils.getData('ambassador_cometchat_uid')
        let p_id = await Utils.getData('ambassador_id');
        let send_data = {
            prospect_uid: item.schedule_user_for_student.cometchat_uid,
            ambassador_uid: p,
            userId: p_id
        }
        let i = {
            cometchat_uid: item.schedule_user_for_student.cometchat_uid,
            user_detail: {
                first_name: item.schedule_user_for_student.user_detail.first_name
            },
            current_status: item?.current_status ? item?.current_status : 'offline',
            last_active: item?.last_active ? item?.last_active : 'offline'

        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        try {
            AmbassadorsServices.add_conversation_info(send_data).then((res: any) => {
                if (res.statusCode == 200) {
                    CometChat.getLoggedinUser().then(
                        user => {
                            if (!user) {
                                CometChat.login(p, authKey).then(
                                    user => {
                                        console.log("Login Successful:", { user });
                                        props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: user })
                                        setBtnDisable(false)
                                    }, error => {
                                        console.log("Login failed with exception:", { error });
                                        setBtnDisable(false)
                                    }
                                );
                            } else if (user) {
                                if (blockList.length > 0) {
                                    blockList?.map((o: any) => {
                                        if (o.uid === item.schedule_user_for_student.cometchat_uid) {
                                            let blockedData = {
                                                isBlocked: true,
                                                blockedByMe: o.blockedByMe,
                                                deactivatedAt: o.deactivatedAt,
                                                hasBlockedMe: o.hasBlockedMe,
                                                lastActiveAt: o.lastActiveAt,
                                                role: o.role,
                                            }
                                            props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: { ...user, ...blockedData } })
                                            setTimeout(() => {
                                                setBtnDisable(false)
                                            }, 1000)
                                            // ToastAndroid.showWithGravity(`You blocked this prospect.To chat,firstly unblock ${item.schedule_user_for_student?.user_detail?.first_name} from the blocked list`, ToastAndroid.SHORT, ToastAndroid.CENTER);
                                        } else {
                                            props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: user })
                                            setTimeout(() => {
                                                setBtnDisable(false)
                                            }, 1000)
                                        }
                                    })
                                } else {
                                    props.navigation.navigate('CometChatConversationListWithMessages', { item: i, type: 'user', loggedInUser: user })
                                    setTimeout(() => {
                                        setBtnDisable(false)
                                    }, 1000)
                                }
                            }
                        }, error => {
                            console.log("Something went wrong", error);
                            setBtnDisable(false)
                        }
                    );


                }

            })
        } catch (error) {
            console.log(error);
        }
    };


    const AdditionalValues = (additinalProps: any) => {
        return (
            <View className='flex flex-col mt-3'>
                <View className='flex flex-row items-center'>
                    {
                        additinalProps.svg ?
                            <SvgXml xml={(additinalProps.svg.replace(/fill="#A52238"/g, `fill="${primaryColor}"`))} width="12px" height="12px" />
                            : <View className='w-[14px] h-[14px] rounded-full flex justify-center items-center' style={{ backgroundColor: primaryColor }}>
                                <View className='w-[5px] h-[5px] rounded-full bg-whiteColor'></View>
                            </View>
                    }
                    <Text className='text-greyBorder text-[12px] leading-5 tracking-[0.44px] font-semibold ml-2 font-InterSemiBold'>{additinalProps.title}</Text>
                </View>
                <View className='ml-4'>
                    <Text className='text-textColor text-[12px] ml-1 leading-5 tracking-[0.44px] font-InterRegular font-normal'>{additinalProps.subtitle + " "}</Text>
                </View>
            </View>
        )
    }
    const stringValue = (myProps: any) => {
        let data = myProps?.map((e: any) => {
            return e.name
        })
        return String(data);
    }
    const momentFormatDate = (date: any): String => {
        const datee = moment(date, "DD MMMM YYYY, HH:mm A").fromNow();
        return datee;
    }

    const renderBookingData = ({ item }: { item: any }) => {
        return (
            <View className='flex bg-whiteColor rounded-[4px] mb-5 w-full py-3'>
                <TouchableOpacity onPress={() => { props.navigation.navigate('CometChatUserProfile', { cometchat_uid: item.schedule_user_for_student.cometchat_uid }) }}>
                    <TouchableOpacity
                        onPress={() => { props.navigation.navigate('CometChatUserProfile', { cometchat_uid: item.schedule_user_for_student.cometchat_uid }) }}
                        className='flex flex-row px-4 py-3'>
                        <View className='w-[130px] h-[135px] rounded-[6px]'>
                            <FastImage source={"profile_image" in item.schedule_user_for_student.user_detail && item.schedule_user_for_student.user_detail.profile_image != null ? { uri: item.schedule_user_for_student.user_detail.profile_image } : Images.no_profile_pic} resizeMode='cover' className='w-full h-full rounded-[6px] relative' />
                            <View className='bg-blackColor50 w-full h-6 absolute bottom-0 rounded-b-[6px] flex justify-center items-center flex-row'>
                                <View className={`w-2 h-2 rounded-full ${item.last_active === 'online' ? 'bg-onlineColor' : item.last_active === 'offline' ? null : 'bg-offlineColor'} mt-[1px]`}></View>
                                {
                                    item.last_active === 'online' || item.last_active === 'offline' ?
                                        <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] ml-1 font-InterRegular font-normal'>
                                            {item.last_active === 'online' ? 'Online' : ''}
                                        </Text>
                                        :
                                        <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] ml-1 font-InterRegular font-normal'>
                                            {momentFormatDate(item.last_active)}
                                        </Text>
                                }
                            </View>
                        </View>

                        <View className='flex flex-col justify-start w-[70%] ml-[10px]'>
                            <View className='flex flex-row items-center w-[85%]'>
                                <View className='pr-3'>
                                    <Text numberOfLines={1} className='text-textColor text-[18px] font-bold leading-8 tracking-[0.15px]'>{item.schedule_user_for_student?.user_detail?.first_name}</Text>
                                </View>
                            </View>

                            <View className='flex flex-row pr-3 items-center w-[85%]'>
                                <Zocial name='email' size={15} color={primaryColor} />
                                <View className='ml-1 pr-3'>
                                    <Text numberOfLines={1} className='text-textColor text-[12px] font-normal leading-5 tracking-[0.44px]'>{item.schedule_user_for_student?.user_detail?.email}</Text>
                                </View>
                            </View>

                            <View className='flex flex-row items-center pr-3 mt-2 ml-[2px] w-[85%]'>
                                <Foundation name='book' size={15} color={primaryColor} />
                                <View className='ml-1 pr-3'>
                                    <Text numberOfLines={1} className='text-textColor ml-1 text-[12px] font-normal leading-5 tracking-[0.44px]'>{item.schedule_user_for_student?.course?.name}</Text>
                                </View>
                            </View>

                            <View className='flex flex-row items-center pr-3 mt-2 w-[85%]'>
                                <Ionicons name='location-sharp' size={15} color={primaryColor} />
                                <View className='pr-3'>
                                    {
                                        (item.additionalFields).map((o: any,i:any) => {
                                            if (o.field_key === 'nationality' || o.field_key === 'state') {
                                                return (
                                                    <Text key={i} numberOfLines={1} className='text-textColor ml-1 text-[12px] font-normal leading-5 tracking-[0.44px]'>{o.attribute_value ? o.attribute_value == null ? '' : o.attribute_value.name : ''}</Text>
                                                )
                                            }
                                        })}
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
                    <View className='flex px-5 py-4'>
                        <View className='flex flex-row items-center'>
                            <View className='w-4 h-4'>
                                <FastImage source={Icons.IcSchedule} resizeMode='contain' className='w-4 h-4' tintColor={primaryColor} />
                            </View>
                            <View className='ml-1'>
                                <Text className='text-greyBorder text-[12px] leading-5 tracking-[0.44px] font-InterSemiBold font-semibold'>Scheduled time slot</Text>
                            </View>
                        </View>

                        <View className='flex flex-row ml-5 justify-between'>
                            <View>
                                <Text className='text-textColor text-[12px] font-InterRegular font-normal leading-5 tracking-[0.44px]'>Date: {moment(item.schedule.schedule_date).format('ll')}</Text>
                            </View>
                            <View className='w-[1px] border-l-[1px] border-l-fieldGrayColor'></View>
                            <View className=''>
                                <Text className='text-textColor text-[12px] font-InterRegular font-normal leading-5 tracking-[0.44px]'>Time: {moment(item.schedule.start_time).format('hh:mm')}-{moment(item.schedule.end_time).format('hh:mm')}</Text>
                            </View>
                        </View>
                    </View>
                    <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
                    <View className='px-5'>
                        {
                            (item.additionalFields).map((o: any, i: any) => {
                                if (o.field_key === 'languages') {
                                    return (<AdditionalValues key={i} svg={o.field_svg} title={o.field_label} subtitle={o.attribute_value == null ? '' : stringValue(o.attribute_value)} />)
                                }
                                // if (o.field_key === 'application_stage') {
                                //     return (<AdditionalValues svg={o.field_svg} title={o.field_label} subtitle={o.attribute_value.application_name == null ? '' : o.attribute_value.application_name} />)
                                // }
                                if (o.field_key == 'profile_picture' || o.field_key == 'program_of_interest' || o.field_key == 'nationality' || o.field_key == 'state') {
                                    return null
                                }
                                else {
                                    return (<AdditionalValues key={i} svg={o.field_svg} title={o.field_label} subtitle={o.attribute_value == null ? '' : o.field_key === 'application_stage' ? o.attribute_value.application_name : o.field_key == 'industry' ? o.attribute_value.name : o.attribute_value} />)
                                }
                            })
                        }
                    </View>
                </TouchableOpacity>
                <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
                <View className='px-5 mt-5'>
                    {
                        btnDisable ?
                            <TouchableOpacity className={`flex justify-center items-center px-8 py-4 rounded-[4px] opacity-60`} style={{ backgroundColor: primaryColor }}>
                                <Text className='text-white text-[14px] leading-5 tracking-[0.44px]'>Chat with {item.schedule_user_for_student?.user_detail?.first_name.split(' ')[0]} now</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity className={`flex justify-center items-center px-2 py-4 rounded-[4px] w-full`} style={{ backgroundColor: primaryColor }} onPress={() => { itemClicked(item) }}>
                                <Text numberOfLines={1} className='text-white text-[14px] leading-5 tracking-[0.44px]'>Chat with {item.schedule_user_for_student?.user_detail?.first_name.split(' ')[0]} now</Text>
                            </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }

    const onRefresh = () => {
        setRefreshing(true);
        getUpcomingSchedules();
        setRefreshing(false);
    }

    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className='px-5 flex flex-1 mt-6'>
                {loader ?
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} color={primaryColor} />
                    </View>
                    :
                    UPCOMING_DATA?.length > 0 ?
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={UPCOMING_DATA}
                            renderItem={renderBookingData}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                            keyExtractor={item => item.id}
                        />
                        :
                        <View className='flex justify-center items-center' style={{ height: Dimensions.get('window').height / 2 }}>
                            <FastImage source={Images.emptyscheduler} resizeMode='cover' className='w-[100px] h-[100px]' />
                            <Text className='text-greyBorder text-xl font-bold leading-8 tracking-[0.15px] text-center mt-5'>You don’t have any upcoming Schedules yet</Text>
                            <Text className='text-greyBorder text-[16px] font-normal leading-4 tracking-[0.44px] text-center mt-5'>Expect prospects to setup a Schedule soon.</Text>
                        </View>
                }
            </View>
        </View>
    )
}

export default UpcomingSchedules