import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, ImageBackground, Image, Dimensions, BackHandler, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons, Images } from '../../../../assets/Images'
import { Colors } from '../../../../common/Colors'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { Utils } from '../../../../common/Utils'
import { COMETCHAT_CONSTANTS } from '../../../../CONSTS'
import * as AmbassadorsServices from '../../../../services/prospect/ambassadors/AmbassadorsServices';
import * as Authservices from '../../../../services/auth/AuthServices';
import { CometChat } from '@cometchat-pro/react-native-chat'
import { SvgXml } from 'react-native-svg'

const CometChatUserProfile = (props: any) => {
    // let DATA = props.route.params.amb_data
    let cometchat_uid = props.route.params.cometchat_uid
    let navigate_key = props.route.params.navigation_key
    const [dob, setDob] = useState('');
    const [profileData, setProfileData] = useState<any>()
    const [state, setState] = useState('');
    const [language, setLanguage] = useState('');
    const [organization, setOrganization] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [nationality, setNationality] = useState('');
    // const [customAdditionalFields, setCustomAdditionalFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [prospectChatUid, setProspectChatUid] = useState(Number);
    const [prospectId, setProspectId] = useState(Number);
    const [roleId, setRoleId] = useState()
    const [refreshing, setRefreshing] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [mandatory, setMandatory] = useState([])
    const [optional, setOptional] = useState([])
    const [isExpanded, setExpanded] = useState(false)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState();
    const [profilePicOptional, setProfilePicOptional] = useState();
    const [profilePic, setProfilePic] = useState();
    const [major, setMajor] = useState('');
    const [majorOptional, setMajorOptional] = useState('');
    const [lastActive, setLastActive] = useState();
    const [email, setEmail] = useState('');
    const [pronouns, setPronouns] = useState('');


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
    useEffect(() => {
        ProfileData()
        setExpanded(false)
    }, [])
    const onRefresh = () => {
        setRefreshing(true);
        ProfileData()
        setExpanded(false)
        setRefreshing(false);
    };

    const stringValue = (myProps: any) => {
        if (myProps.length > 0) {
            let data = myProps?.map((e: any) => {
                return e.name
            })
            return String(data);
        }
        else {
            return ''
        }
    }

    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo?.college_data[0]?.font_color;
    const timeZone = moment.tz.guess();

    const ProfileData = async () => {
        setIsLoading(true)
        let user = await Utils.getData('user_details');
        setRoleId(user.role_id);
        try {
            let response: any = await Authservices.profile_data(props.route.params.cometchat_uid, timeZone);
            // console.log("data------------->", JSON.stringify(response.data.last_active))
            if (response.statusCode == 200) {
                setIsLoading(false)
                setMandatory(response.data.mandatory_fields)
                setOptional(response.data.optional_fields);
                setProfileData(response.data);
                let first_name: any = response.data.mandatory_fields?.find((t: any) => (t.field_key == 'first_name')) ?? null
                let last_name: any = response.data.mandatory_fields?.find((t: any) => (t.field_key == 'last_name')) ?? null
                let email: any = response.data.mandatory_fields?.find((t: any) => (t.field_key == 'email')) ?? null
                let pp: any = response.data.mandatory_fields?.find((t: any) => (t.field_key == 'profile_picture')) ?? null
                let pp_optional: any = response.data.optional_fields?.find((t: any) => (t.field_key == 'profile_picture')) ?? false
                let major_optional: any = response.data.optional_fields?.find((t: any) => (t.field_key == 'program_of_interest')) ?? {}
                let pronouns_optional: any = response.data.optional_fields?.find((t: any) => (t.field_key == 'pronouns')) ?? {}
                let major: any = response.data.mandatory_fields?.find((t: any) => (t.field_key == 'program')) ?? {}
                setFirstName(first_name?.field_value);
                setLastName(last_name?.field_value);
                setMajor(major?.field_value?.name);
                setProfilePic(pp?.field_value);
                setProfilePicOptional(pp_optional?.field_value === '' ? null : pp_optional == false ? false : pp_optional?.field_value)
                setEmail(email?.field_value);
                setMajorOptional(major_optional?.field_value?.name)
                setPronouns(pronouns_optional?.field_value)
            }
        } catch (error) {
            console.log('error:', error)
            setIsLoading(false)
        }
    }

    const languages = (myProps: any) => {
        let data = myProps?.map((e: any) => {
            return e.name
        })
        return String(data);
    }

    const toggleExpansion = () => {
        setExpanded(!isExpanded);
    };

    const AdditionalValues = (additinalProps: any) => {
        return (
            additinalProps.field_key === 'profile_picture' || additinalProps.field_key === 'first_name' || additinalProps.field_key === 'last_name' || additinalProps.field_key === 'email' || additinalProps.field_key === 'profile_picture' ? null :
                <View className='flex flex-col my-1' key={additinalProps.field_key}>
                    <View className='flex flex-row items-center'>
                        {additinalProps.field_type === 'custom' ?
                            <View className='w-[14px] h-[14px] rounded-full flex justify-center items-center' style={{ backgroundColor: primaryColor }}>
                                <View className='w-[6px] h-[6px] rounded-full bg-whiteColor'></View>
                            </View>
                            :
                            <SvgXml xml={(additinalProps?.svg?.replace(/fill="#A52238"/g, `fill="${primaryColor}"`))} width="18px" height="18px" />
                        }

                        <Text className={`text-greyBorder text-[12px] leading-5 tracking-[0.44px] font-InterSemiBold ${additinalProps.field_type === 'custom' ? 'ml-3' : 'ml-2'}`}>{additinalProps.title}</Text>
                    </View>
                    {
                        additinalProps.field_type === 'select_multi' ?

                            <View className='ml-[6.5px]'>
                                <Text className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'>{additinalProps.subtitle == null ? "" : languages(additinalProps.subtitle)}</Text>
                            </View>
                            :
                            additinalProps.field_type === 'select_one' ?
                                <View className='ml-[6.5px]'>
                                    <Text className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'>{additinalProps.subtitle == null ? "" : additinalProps.subtitle.name}</Text>
                                </View>
                                :
                                additinalProps.field_key == 'about_me' ?
                                    <View className='ml-[6.5px]'>
                                        <Text className='text-textColor text-[14px] leading-5 tracking-[0.44px] font-InterRegular'>
                                            {isExpanded || additinalProps.subtitle.length < 67 ? additinalProps.subtitle : `${additinalProps.subtitle.slice(0, 67)}...`}
                                        </Text>
                                        {additinalProps.subtitle.length > 67 && (
                                            <TouchableOpacity onPress={toggleExpansion}>
                                                <Text
                                                    className='text-textColor text-[14px] leading-5 tracking-[0.44px] font-InterRegular'
                                                >
                                                    {isExpanded ? '' : 'Read More'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    :
                                    <View className='ml-[6.5px]'>
                                        <Text className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'>{additinalProps.subtitle == null ? "" : additinalProps.subtitle}</Text>
                                    </View>

                    }
                </View>
        )
    }

    const chatwith = async () => {
        setBtnDisable(true)
        let p = await Utils.getData('prospect_cometchat_uid')
        let p_id = await Utils.getData('prospect_userId');
        let send_data = {
            prospect_uid: p,
            ambassador_uid: profileData?.cometchat_uid,
            userId: p_id
        }
        const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
        try {
            AmbassadorsServices.add_conversation_info(send_data).then((res: any) => {
                if (res.statusCode == 200) {
                    CometChat.getLoggedinUser().then(
                        user => {
                            if (!user) {
                                CometChat.login(prospectChatUid, authKey).then(
                                    user => {
                                        props.navigation.navigate('CometChatConversationListWithMessages', { item: profileData, type: 'user', loggedInUser: user })
                                        setBtnDisable(false)
                                    }, error => {
                                        console.log("Login failed with exception:", { error });
                                        setBtnDisable(false)
                                    }
                                );
                            } else if (user) {
                                props.navigation.navigate('CometChatConversationListWithMessages', { item: profileData, type: 'user', loggedInUser: user })
                                setTimeout(() => {
                                    setBtnDisable(false)
                                }, 1000)
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
    }

    const screenWidth = Math.floor(Dimensions.get('screen').width)

    const momentFormatDate = (date: any): String => {
        const datee = moment(date, "DD MMMM YYYY, HH:mm A").fromNow();
        return datee;
    }
    console.log(pronouns)
    return (
        <View className='flex flex-1 bg-bgGrayColor'>
            <View className={`flex flex-row items-center py-5 px-4`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[40px] h-[40px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] font-Helvetica ml-2 mt-[3px]'>Profile</Text>
            </View>
            {
                isLoading ?
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} className='' color={primaryColor} />
                    </View>
                    :
                    <>
                        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                            <View className='w-full py-3 flex items-center justify-center'>
                                {roleId == 4 ?
                                    profilePicOptional == false ?
                                        null
                                        :
                                        < View className='relative rounded-full w-[140px] h-[140px]'>
                                            <FastImage source={profilePicOptional == null ? Images.pic3 : { uri: profilePicOptional }} className='w-full h-full rounded-full' resizeMode='contain' />
                                        </View>
                                    :
                                    (<View className='relative rounded-full w-[140px] h-[140px]'>
                                        <FastImage source={{ uri: profilePic }} className='w-full h-full rounded-full' resizeMode='contain' />
                                    </View>)
                                }
                                <View className='flex flex-row px-[12px] items-center justify-center mt-7' style={{ width: screenWidth * 8 / 9 }}>
                                    <View className='flex flex-row max-w-[90%] items-center justify-center'>
                                        <Text className='text-textColor font-HelveticaBold font-bold text-[24px] leading-7 tracking-[0.44px]'>{roleId == 4 ? firstName + " " + lastName : firstName}</Text>
                                        {
                                            (roleId == 5 && pronouns) ?
                                                <View>
                                                    <Text className='text-textColor font-InterRegular font-normal text-[16px] leading-4 tracking-[0.15px] ml-2 text-center'>{'(' + pronouns + ')'}</Text>
                                                </View>
                                                : null
                                        }
                                    </View>
                                </View>
                                {
                                    major ?
                                        <View className='px-2 items-center mt-1' style={{ width: screenWidth }}>
                                            <Text className='text-textColor text-[12px] font-normal leading-5 tracking-[0.44px] font-InterRegular text-center'>{major}</Text>
                                        </View>
                                        : null
                                }
                                {
                                    majorOptional ?
                                        <View className='px-2 items-center mt-1' style={{ width: screenWidth }}>
                                            <Text className='text-textColor text-[12px] font-normal leading-5 tracking-[0.44px] font-InterRegular text-center'>{majorOptional}</Text>
                                        </View>
                                        : null
                                }
                                <View className='flex flex-row items-center px-5 my-1'>
                                    {
                                        profileData?.last_active === 'offline' ?
                                            null
                                            :
                                            <>
                                                <View className={`w-[6px] h-[6px] mt-1 rounded-full ${profileData?.last_active === 'online' ? 'bg-onlineColor' : 'bg-offlineColor'} mt-[1px]`}></View>
                                                <Text className={`${profileData?.last_active === 'online' ? 'text-onlineColor' : 'text-textColor'} text-[10px] leading-4 tracking-[0.44px] ml-1 font-InterRegular font-normal`}> {profileData?.last_active === 'online' ? 'Active now' : "Last online: " + momentFormatDate(profileData?.last_active)}</Text>
                                            </>
                                    }
                                </View>
                            </View>

                            <View className='flex flex-auto pb-[10px]'>
                                {
                                    roleId === 5 ?
                                        <View className='flex pb-3 bg-whiteColor mt-3 w-full px-6'>
                                            {
                                                mandatory?.map((o: any, i: any) => {
                                                    if (o.field_key !== 'program') {
                                                        return (
                                                            <AdditionalValues
                                                                key={i}
                                                                title={o.field_label}
                                                                subtitle={o.field_value}
                                                                svg={o.field_svg}
                                                                field_key={o.field_key}
                                                                field_type={o.field_type}
                                                            />
                                                        )
                                                    }
                                                })
                                            }
                                        </View>
                                        : <></>
                                }
                            </View>
                            <View className='flex flex-auto pb-6'>
                                {
                                    optional?.length ?
                                        <View className='flex pb-3 bg-whiteColor mt-3 w-full px-6'>
                                            {
                                                optional?.map((o: any, i: any) => {
                                                    if (o.field_key !== 'program_of_interest' && o.field_key !== 'pronouns') {
                                                        return (
                                                            <AdditionalValues
                                                                key={i}
                                                                title={o.field_label}
                                                                subtitle={o.field_value}
                                                                svg={o.field_svg}
                                                                field_key={o.field_key}
                                                                field_type={o.field_type}
                                                            />
                                                        )
                                                    }
                                                })
                                            }
                                        </View>
                                        : <></>
                                }

                            </View>
                        </ScrollView>
                        {
                            roleId == 4 || navigate_key === 'CHAT' ?
                                null
                                :
                                <View className='flex flex-row justify-between items-center px-4 py-4 bg-whiteColor'>
                                    <TouchableOpacity
                                        onPress={() => { props.navigation.navigate('ScheduleChat', { mentorId: profileData?.id, profile_image: profileData?.user_detail.profile_image, mentor_name: profileData?.user_detail.first_name, primaryColor: primaryColor }) }}
                                        className='flex justify-center items-center px-4 py-4 rounded-[4px] border-[1px] border-greyBorder' style={{}}>
                                        <Text className='text-greyBorder text-[14px] leading-5 font-InterMedium font-medium tracking-[0.44px]'>Schedule chat</Text>
                                    </TouchableOpacity>

                                    {
                                        btnDisable ?
                                            <TouchableOpacity className={`flex flex-1 justify-center items-center px-1 ml-3 py-4 rounded-[4px] opacity-60`} style={{ borderColor: primaryColor, borderWidth: 1, backgroundColor: primaryColor, width: (screenWidth) / 2 + 10 }}>
                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text className='text-white text-[16px] font-HelveticaBold font-bold leading-5  tracking-[0.44px]' numberOfLines={1}>Loading...</Text>
                                                </View>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity
                                                className={`flex flex-1 justify-center items-center px-1 ml-3 py-4 rounded-[4px]`}
                                                style={{ borderColor: primaryColor, borderWidth: 1, backgroundColor: primaryColor, width: (screenWidth) / 2 + 10 }}
                                                onPress={() => { chatwith() }}>
                                                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                    {/* <Text className='text-white text-[12px] font-HelveticaBold leading-5  tracking-[0.44px]' numberOfLines={1}>Chat with {profileData?.user_detail.first_name.split(' ')[0]}</Text> */}
                                                    <Text className='text-white text-[16px] font-HelveticaBold font-bold leading-5  tracking-[0.44px]' numberOfLines={1}>Ask me a question</Text>
                                                </View>
                                            </TouchableOpacity>

                                    }

                                </View>
                        }
                    </>
            }
        </View >
    )
}

export default CometChatUserProfile