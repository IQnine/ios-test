import { View, Text, TouchableOpacity, Pressable, Touchable, TouchableWithoutFeedback, InteractionManager } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../assets/Images'
import moment from 'moment'
import { SvgXml } from 'react-native-svg'
import { useDebounce } from '../common/CommonFunctions'
import * as AmbassadorsServices from '../services/prospect/ambassadors/AmbassadorsServices';
import { COMETCHAT_CONSTANTS } from '../CONSTS'
import { CometChat } from '@cometchat-pro/react-native-chat'

const AmbassadorList = React.memo((props: any) => {
    const { debounce } = useDebounce();
    const [btnDisable, setBtnDisable] = useState(false);

    const momentFormatDate = (date: any): String => {
        const datee = moment(date, "DD MMMM YYYY, HH:mm A").fromNow();
        return datee;
    }

    const itemClicked = async (item: any) => {
        setBtnDisable(true)
        let send_data = {
            prospect_uid: props.prospectChatUid,
            ambassador_uid: item.cometchat_uid,
            userId: props.prospectId
        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        try {
            AmbassadorsServices.add_conversation_info(send_data).then((res: any) => {
                if (res.statusCode == 200) {
                    CometChat.getLoggedinUser().then(
                        user => {
                            if (!user) {
                                CometChat.login(props.prospectChatUid, authKey).then(
                                    user => {
                                        props.navigation.navigate('CometChatConversationListWithMessages', { item: item, type: 'user', loggedInUser: user })
                                        setBtnDisable(false)
                                    }, error => {
                                        console.log("Login failed with exception:", { error });
                                        setBtnDisable(false)
                                    }
                                );
                            } else if (user) {
                                InteractionManager.runAfterInteractions(() => {
                                    props.navigation.navigate('CometChatConversationListWithMessages', { item: item, type: 'user', loggedInUser: user })
                                    setTimeout(() => {
                                        setBtnDisable(false)
                                    }, 1000)
                                })
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



    return (
        <View key={props.index} className='flex bg-whiteColor  rounded-[4px] my-3 mx-1 h-[250px]' style={{ elevation: 3 }} >
            <Pressable className='flex flex-row px-4 pt-3 items-center h-[160px]' onPress={() => { props.navigation.navigate('CometChatUserProfile', { cometchat_uid: props.item.cometchat_uid }) }}>
                <View className='w-[125px] h-[135px] rounded-[6px]'>
                    <FastImage source={{ uri: props.item.user_detail.profile_image }} resizeMode='cover' className='w-full h-full rounded-[6px] relative' />
                    <View className='bg-blackColor50 w-full h-6 absolute bottom-0 rounded-b-[6px] flex justify-center items-center flex-row'>
                        {
                            props.item.last_active === 'online' ?
                                <View className={`w-2 h-2 rounded-full ${props.item.last_active === 'online' ? 'bg-onlineColor' : props.item.last_active === 'offline' ? null : 'bg-offlineColor'} mt-[1px]`}></View>
                                : null
                        }
                        {
                            props.item.last_active === 'online' || props.item.last_active === 'offline' ?
                                <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.44px] ml-1 font-InterRegular font-normal'>
                                    {props.item.last_active === 'online' ? 'Online' : ''}
                                </Text>
                                :
                                <Text className='text-whiteColor text-[9px] leading-5 tracking-[0.15px] ml-1 font-InterRegular font-normal'>
                                    Last online: {momentFormatDate(props.item.last_active)}
                                </Text>
                        }
                    </View>
                </View>

                <View className='flex flex-col justify-start w-[70%] mb-[6px]'>
                    <View className='flex flex-row items-center w-[80%] ml-3 mb-2'>
                        <View className='flex-shrink'>
                            <Text numberOfLines={1} className='text-textColor text-[16px]  font-HelveticaBold leading-5  tracking-[0.15px]'>{props.item.user_detail.first_name.split(' ')[0]}</Text>
                        </View>
                    </View>

                    <View className='flex flex-row mt-1' >
                        <View className='ml-4 flex-row pr-2 w-[85%] items-center'>
                            <FastImage source={Icons.IcSpecification} resizeMode='center' className='w-[14px] h-[14px]' tintColor={props.primaryColor} />
                            <Text numberOfLines={2} className=' text-textColor  text-[12px] font-InterRegular font-normal ml-[10px] mr-3  tracking-[0.44px]'>{props.item.user_detail.Program?.name}</Text>
                        </View>
                    </View>

                    {
                        props.item.additional.map((o: any, i: any) => {
                            if (o.display == 1 && o.attribute_name !== 'pronouns') {
                                return (
                                    <View key={i} className='flex flex-row justify-start items-start mt-[1px] ml-2'>
                                        {/* <FastImage source={Icons.IcLocation} resizeMode='center' className='w-[15px] h-4' /> */}
                                        <View className='ml-2 pr-3 flex-row items-center'>
                                            {
                                                o.field_type == 'custom' ?
                                                    <View className='w-[10px] h-[10px] rounded-full flex justify-center mt-[2px] items-center leading-4' style={{ backgroundColor: props.primaryColor }}>
                                                        <View className='w-[4px] h-[4px] rounded-full bg-whiteColor'></View>
                                                    </View>
                                                    :
                                                    <SvgXml xml={(o.field_svg?.replace(/fill="#A52238"/g, `fill="${props.primaryColor}"`))} width="12px" height="12px" className='' />
                                            }
                                            <Text className='text-textColor text-[12px] font-InterRegular leading-5  mx-3 flex pr-2 tracking-[0.44px]' numberOfLines={1}>{o.attribute_value == null ? '' : o.attribute_value + "  "}</Text>
                                        </View>
                                    </View>
                                )
                            }
                        })
                    }
                </View>
            </Pressable>
            <View className='w-full h-[1px] bg-fieldGrayColor mt-2'></View>
            <View className='flex flex-row justify-between items-center px-4 py-4 w-full'>
                <TouchableOpacity className='flex justify-center items-center px-1 py-4 rounded-[4px] border-[1px] border-greyBorder w-[43%]' onPress={() => { props.navigation.navigate('ScheduleChat', { mentorId: props.item.id, profile_image: props.item.user_detail.profile_image, mentor_name: props.item.user_detail.first_name }) }}>
                    <Text className='text-greyBorder text-[14px] leading-5 tracking-[0.44px] font-InterMedium text-center'>Schedule chat</Text>
                </TouchableOpacity>

                {
                    btnDisable ?
                        <TouchableOpacity disabled={true} className={`flex justify-center items-center px-1 py-4 rounded-[4px] w-[53%] opacity-60 `} style={{ backgroundColor: props.primaryColor, borderColor: props.primaryColor, borderWidth: 1 }}>
                            <View className='w-full'>
                                <Text className='text-white text-[12px] leading-5 tracking-[0.44px] font-HelveticaBold text-center' numberOfLines={1} >Loading...</Text>
                            </View>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity className={`flex justify-center items-center px-1 py-4 rounded-[4px] w-[53%] `} style={{ backgroundColor: props.primaryColor, borderColor: props.primaryColor, borderWidth: 1 }} onPress={() => { itemClicked(props.item) }}>
                            <View className='w-full'>
                                <Text className='text-white text-[14px] leading-5 tracking-[0.44px] font-HelveticaBold text-center' numberOfLines={1} > Chat with {props.item.user_detail.first_name.split(' ')[0]}</Text>
                            </View>
                        </TouchableOpacity>
                }
            </View>
        </View>
    )
})

export default AmbassadorList