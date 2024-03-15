import { View, Text, TouchableOpacity, ScrollView, ToastAndroid, ActivityIndicator, BackHandler, RefreshControl, SafeAreaView, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import { Colors } from '../../../common/Colors'
import { Icons, Images } from '../../../assets/Images'
import * as ProfileServices from '../../../services/prospect/profile/ProfileServices';
import { useSelector } from 'react-redux'
import { useIsFocused } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg'

const AmbassadorPrfoile = (props: any) => {
    const isFocus = useIsFocused();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mandatory, setMandatory] = useState([])
    const [optional, setOptional] = useState([])
    const [isExpanded, setExpanded] = useState(false)
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    let primaryColor = instituteInfo.college_data[0].font_color;

    useEffect(() => {
        get_field_detail_v2()
        setExpanded(false)
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
                                        <Text className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'>
                                            {isExpanded || additinalProps.subtitle.length < 67 ? additinalProps.subtitle : `${additinalProps.subtitle.slice(0, 67)}...`}
                                        </Text>
                                        {additinalProps.subtitle.length > 67 && (
                                            <TouchableOpacity onPress={toggleExpansion}>
                                                <Text
                                                    className='text-textColor text-[14px]  leading-5 tracking-[0.44px] ml-[1.7px] font-InterRegular'
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
    const UserDetailRender = (myProps: any) => {
        let first_name: any = mandatory?.find((t: any) => (t.field_key == 'first_name')) ?? {}
        let last_name: any = mandatory?.find((t: any) => (t.field_key == 'last_name')) ?? {}
        let email: any = mandatory?.find((t: any) => (t.field_key == 'email')) ?? {}
        let pronouns: any = optional?.find((t: any) => (t.field_key == 'pronouns')) ?? null
        console.log(pronouns)
        return (
            <SafeAreaView className={`ml-[20px] mt-2 max-w-[60%]`}>
                <View className={`flex flex-row justify-start items-center max-w-[100%]`}>
                    <View className='flex flex-row flex-wrap max-w-[75%]'>
                        <Text className={`text-textColor font-HelveticaBold  text-[18px] leading-6 tracking-[0.15px] font-bold`}>
                            {`${first_name?.field_value + " " + last_name.field_value}`}
                        </Text>
                        {/* <Text> </Text>
                        <Text className={`text-textColor font-HelveticaBold  text-[18px] leading-4 tracking-[0.15px] font-bold`}>
                            {last_name.field_value}
                        </Text> */}
                    </View>
                    {
                        pronouns ?
                            <View className='ml-1'>
                                <Text className='text-textColor font-InterRegular  text-[13px] leading-4 tracking-[0.15px] font-normal'>{'(' + pronouns.field_value + ')'}</Text>
                            </View>
                            : <></>
                    }

                    <View className='max-w-[100%] flex flex-row'>
                        <TouchableOpacity
                            onPress={() => {
                                props.navigation.navigate('AmbassadorEditProfile')
                                setMandatory([])
                                setOptional([])
                            }} className='ml-3 flex justify-center items-center rounded-[4px] w-6 h-6 border-[1px] border-greyBorder bg-whiteColor'>
                            <View className='w-4 h-4'>
                                <FastImage source={Icons.IcEdit} resizeMode='contain' className='w-full h-full' />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    <View className='flex'>
                        <Text className='text-textColor font-InterRegular  text-[12px] leading-5 tracking-[0.44px] font-normal'>{email.field_value}</Text>
                    </View>
                }
            </SafeAreaView>
        )
    }

    const onRefresh = () => {
        setRefreshing(true);
        setExpanded(false)
        get_field_detail_v2();
        setRefreshing(false);
    };

    let pp: any = mandatory?.find((t: any) => (t.field_key == 'profile_picture')) ?? null

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
                                pp != null ?
                                    <View className='flex items-center flex-row w-full'>
                                        {
                                            (pp.field_value === undefined || pp.field_value === null || pp === null) ? <View className='w-[80px] h-[80px] rounded-full justify-center items-center bg-bgGrayColor'>
                                                <FastImage source={Images.pic3} resizeMode='contain' className='w-full h-full rounded-full' />
                                            </View>
                                                :
                                                <View className='w-[80px] h-[80px] rounded-full justify-center items-center'>
                                                    <FastImage source={{ uri: pp.field_value }} resizeMode='contain' className='w-full h-full rounded-full' />
                                                </View>
                                        }
                                        <UserDetailRender isProfilePic={'WITH_PROFILE_IMAGE'} />
                                    </View>
                                    :
                                    <UserDetailRender isProfilePic={'WITH_PROFILE_IMAGE'} />
                            }
                        </View>

                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />}>
                            <View className='mt-5 px-5 flex flex-auto pb-6'>
                                {
                                    isLoading ?
                                        <ActivityIndicator size={'large'} color={primaryColor} />
                                        :
                                        <View>
                                            {
                                                mandatory?.length > 3 ?
                                                    <View className='flex px-5 py-3 bg-whiteColor rounded-[4px]'>
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
                                                    <View className='flex px-5 py-3 bg-whiteColor rounded-[4px] mt-6'>
                                                        {
                                                            optional?.map((o: any, i: any) => {
                                                                if (o.field_key !== 'pronouns') {
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

export default AmbassadorPrfoile