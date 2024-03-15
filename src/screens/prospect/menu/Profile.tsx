import { View, Text, TouchableOpacity, ScrollView, ToastAndroid, ActivityIndicator, BackHandler, RefreshControl, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Colors } from '../../../common/Colors'
import { Icons, Images } from '../../../assets/Images'
import * as ProfileServices from '../../../services/prospect/profile/ProfileServices';
import { useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg'

const Profile = (props: any) => {
    const isFocus = useIsFocused();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mandatory, setMandatory] = useState([])
    const [optional, setOptional] = useState([])
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    let primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        get_field_detail_v2()
    }, [isFocus])

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

    const get_field_detail_v2 = async () => {
        setIsLoading(true)
        try {
            await ProfileServices.get_field_detail_v2().then((res: any) => {
                if (res.statusCode === 200) {
                    setMandatory(res.data.mandatory_fields)
                    setOptional(res.data.optional_fields)
                    setIsLoading(false)
                }
            })
        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }
    }


    const languages = (myProps: any) => {
        let data = myProps?.map((e: any) => {
            return e.name
        })
        return String(data);
    }

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
                                <View className='ml-[6.5px]'>
                                    <Text className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'>{additinalProps.subtitle == null ? "" : additinalProps.subtitle}</Text>
                                </View>

                    }
                </View>
        )
    }
    const screenWidth = Math.floor(Dimensions.get('screen').width)

    const UserDetailRender = (myProps: any) => {
        let first_name: any = mandatory?.find((t: any) => (t.field_key == 'first_name')) ?? {}
        let last_name: any = mandatory?.find((t: any) => (t.field_key == 'last_name')) ?? {}
        let email: any = mandatory?.find((t: any) => (t.field_key == 'email')) ?? {}
        return (
            <View className={`flex mt-2 ${myProps.isProfilePic == 'WITH_PROFILE_IMAGE' ? 'w-[75%]' : 'w-[90%]'}`}>
                <View className={`flex flex-row mt-2 ${myProps.isProfilePic == 'WITH_PROFILE_IMAGE' ? 'items-center justify-center' : 'items-start'}`} style={{ maxWidth: screenWidth * 8 / 9 }}>
                    {
                        <View className={`flex flex-row flex-wrap ${myProps.isProfilePic == 'WITH_PROFILE_IMAGE' ? 'items-center justify-center' : 'items-start'}`}>
                            <Text className={`text-textColor font-HelveticaBold  text-[22px] tracking-[0.15px] font-bold text-center`}>
                                {first_name?.field_value}
                            </Text>
                            <View className='w-2'></View>
                            <Text className={`text-textColor font-HelveticaBold  text-[22px] tracking-[0.15px] font-bold text-center`}>
                                {last_name.field_value}
                            </Text>
                        </View>
                    }

                    <TouchableOpacity
                        onPress={() => { props.navigation.navigate('EditProfile') }}
                        className='flex justify-center items-center rounded-[4px] w-7 h-7 border-[1px] border-greyBorder bg-whiteColor ml-3'>
                        <View className='w-4 h-4'>
                            <FastImage source={Icons.IcEdit} resizeMode='contain' className='w-full h-full' />
                        </View>
                    </TouchableOpacity>
                </View>
                <View className={`flex ${myProps.isProfilePic === 'WITH_PROFILE_IMAGE' ? 'items-center justify-center' : 'items-start'} mt-2 `}>
                    <Text className='text-textColor font-InterRegular  text-[12px] leading-5 tracking-[0.44px] font-normal text-center'>{email.field_value}</Text>
                </View>
            </View>
        )
    }

    const onRefresh = () => {
        setRefreshing(true);
        get_field_detail_v2();
        setRefreshing(false);
    };

    let pp: any = optional?.find((t: any) => (t.field_key == 'profile_picture')) ?? null
    return (
        <SafeAreaView className='flex flex-1 bg-bgGrayColor '>
            <View className={`flex flex-row items-center px-2 py-5`} style={{ backgroundColor: primaryColor }}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] leading-8 font-Helvetica tracking-[0.44px] font-normal ml-1'>Profile</Text>
            </View>
            {
                isLoading ?
                    <View className='flex flex-1 justify-center items-center'>
                        <ActivityIndicator size={'large'} color={primaryColor} />
                    </View>
                    :
                    <>
                        <View className='flex px-5 py-5 bg-greyColor25'>
                            {
                                pp ?
                                    <View className='flex justify-center items-center'>
                                        {
                                            (pp.field_value === undefined || pp.field_value === null || pp === null || pp.field_value === '') ?
                                                <View className='w-[80px] h-[80px] rounded-full justify-center items-center bg-bgGrayColor'>
                                                    <FastImage source={Images.pic3} resizeMode='contain' className='w-full h-full rounded-full' />
                                                </View>
                                                :
                                                <View className='w-[80px] h-[80px] rounded-full justify-center  items-center'>
                                                    <FastImage source={{ uri: pp.field_value }} resizeMode='contain' className='w-full h-full rounded-full' />
                                                </View>
                                        }
                                        <UserDetailRender isProfilePic={'WITH_PROFILE_IMAGE'} />
                                    </View>
                                    :
                                    <UserDetailRender isProfilePic={'WITHOUT_PROFILE_IMAGE'} />
                            }
                        </View>

                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />}>
                            <View className='mt-5 px-5 flex flex-auto pb-6'>
                                {
                                    <View>
                                        {
                                            mandatory?.length > 3 ?
                                                <View className='flex px-5 py-4 bg-whiteColor rounded-[4px]'>
                                                    {
                                                        mandatory?.map((o: any, i: any) => {
                                                            if (o.field_key !== 'profile_picture') {
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
                                                </View> :
                                                <></>
                                        }
                                        {
                                            optional.length != 0 && optional?.length > 0 ?
                                                <View className='flex px-5 py-2 bg-whiteColor rounded-[4px] mt-6'>
                                                    {
                                                        optional?.map((o: any, i: any) => {
                                                            if (o.field_key !== 'profile_picture') {
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
                                                : null
                                        }
                                    </View>
                                }
                            </View>
                        </ScrollView>
                    </>
            }

        </SafeAreaView>
    )
}

export default Profile