import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, ToastAndroid, BackHandler, Dimensions, Keyboard } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import FastImage from 'react-native-fast-image'
import LinearGradient from 'react-native-linear-gradient'
import { Images } from '../../assets/Images'
import { Colors } from '../../common/Colors'
import { Fonts } from '../../common/Fonts'
import { KeycodeInput } from '../../components/KeyCodeInput/KeyCode'
import { Utils } from '../../common/Utils'
import GradientButton from '../../components/Gradientbtn'
import { setUserInfo } from '../../redux/action/UserAction'
import * as AuthAPIServices from '../../services/auth/AuthServices'
import * as InstituteServices from '../../services/prospect/institutes/InstituteServices';
import { useSelector, useDispatch } from 'react-redux'
import { CometChat } from '@cometchat-pro/react-native-chat'
import { COMETCHAT_CONSTANTS } from '../../CONSTS'
import { setInstituteInfo } from '../../redux/action/InstituteAction'
import { ScreenWidth } from 'react-native-elements/dist/helpers'
import { OtpInput } from "react-native-otp-entry";

interface userData {
    role_id: string,
    role: string,
}



const Otp = (props: any) => {
    const dispatch = useDispatch();
    let otpInput: any = useRef(null);
    const [otpCode, setOtpCode] = useState('');
    const [wrongOtp, setWrongOtp] = useState(false)
    const [mobileNumber, setMobileNumber] = useState(null)
    const [count, setCount] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [hasErr, setHasErr] = useState(false);
    const [hasBtnDisable, setBtnDisable] = useState(true);
    const [resendLoading, setResendLoading] = useState(false);
    useEffect(() => {
        setCountInterval();
        setContactNumber();
    });
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
        if (otpCode.length < 4 && wrongOtp) {
            setWrongOtp(false);
        }
    }, [otpCode]);

    const setContactNumber = async () => {
        let mobile_number = await Utils.getData('mobilenumber');
        setMobileNumber(mobile_number)
    }

    const setCountInterval = async () => {
        let value = count;
        setTimeout(() => {
            if (count <= 0) {
                clearInterval(value);
            } else {
                setCount((value - 1));
            }
        }, 1000);
    };

    function btn_visible() {
        setBtnDisable(false)
    }
    function btn_invisible() {
        setBtnDisable(false)
    }
    const prospectOtp = async (otp: any) => {
        if (hasErr == false) {
            Keyboard.dismiss()
            try {
                let token = await Utils.getData('app_token');
                setIsLoading(true);
                if (otp.trim().length == 4) {
                    await AuthAPIServices.otp_verification(otp).then((res: any) => {
                        if (res.statusCode == 200) {
                            setHasErr(false);
                            setWrongOtp(false);
                            setIsLoading(false)
                            dispatch(setUserInfo(props.route.params))
                            props.navigation.replace('ProspectStack', { screen: 'Institution' })
                            Utils.storeData('user_details', { email: props.route.params.email, role_id: props.route.params.role_id })
                        } else {
                            setHasErr(true);
                            setWrongOtp(true);
                            setIsLoading(false)
                        }
                    })
                } else {
                    setHasErr(true);
                    setWrongOtp(true);
                    setIsLoading(false)
                }
            } catch (error) {
                setHasErr(true);
                setIsLoading(false);
            }
        }
    }

    const college_login = async (college_id: number) => {
        try {
            let send_data = {
                email_mobile: props.route.params.email,
                college_id: college_id,
                user_role_id: props.route.params.role_id
            }
            let t: any = await InstituteServices.college_login(send_data);
            if (t.statusCode == 200) {
                return t
            } else if (t.statusCode == 400){
                if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(
                        t.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getCollegeData = async (college_id: number) => {
        try {
            let t: any = await InstituteServices.get_colleges_by_id(college_id);
            if (t.statusCode == 200) {
                return t
            }
        } catch (error) {
            console.log(error);

        }
    }

    function cometChatLoginAndRedirect(cometchatUID: any, authKey: any, result: any, props: any, collegeId: any, ambassadorId: any, college_data: any, dispatch_data: any) {
        CometChat.login(cometchatUID, authKey)
            .then(
                (user) => {
                    handleLoginSuccess(props, result, collegeId, ambassadorId, college_data, dispatch_data, cometchatUID);
                    // result.data.is_profile_complete == 1 ?
                    //     props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
                    //     : props.navigation.replace('CompleteProfile', { email: props.route.params.email, uid: cometchatUID })
                },
                (error) => {
                    let comet_user = new CometChat.User(cometchatUID);
                    let tags = ["ambassadors", `ambassadors-${college_data.data[0]?.slug}`, college_data.data[0]?.slug];
                    let n = AuthAPIServices.encrypt(result.data.user_detail?.first_name);
                    comet_user.setName(n);
                    comet_user.setTags(tags);
                    createUserAndLogin(comet_user, authKey, result, collegeId, ambassadorId, college_data, dispatch_data);
                }
            )
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }


    const cometChatLogin = async (result: any, authKey: any, collegeId: any, ambassadorId: any, college_data: any, dispatch_data: any) => {
        try {
            CometChat.login(result.data.cometchat_uid, authKey).then(
                (user) => {
                    handleLoginSuccess(props, result, collegeId, ambassadorId, college_data, dispatch_data, result.data.cometchat_uid);
                    // result.data.is_profile_complete == 1 ?
                    //     props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
                    //     : props.navigation.replace('CompleteProfile', { email: props.route.params.email, uid: result.data.cometchat_uid })

                },
                (error) => {
                    console.log('Login failed with exception:', { error });
                    setIsLoading(false)
                },
            ).catch(err => {
                console.log(err);
                setIsLoading(false)
            });
        } catch (error) {
            console.log(error)
        }
    }
    function handleLoginSuccess(props: any, result: any, collegeId: any, ambassadorId: any, college_data: any, dispatch_data: any, cometchatUID: any) {
        setHasErr(false);
        setWrongOtp(false);
        setIsLoading(false);
        dispatch(setUserInfo(props.route.params));
        Utils.storeData('accessToken', result.data.accessToken);
        Utils.storeData('user_details', { email: props.route.params.email, role_id: props.route.params.role_id });
        Utils.storeData('ambassador_college_id', collegeId);
        Utils.storeData('ambassador_id', ambassadorId);
        Utils.storeData('primaryColor', college_data.data[0]?.font_color);
        Utils.storeData('ambassador_cometchat_uid', cometchatUID);
        Utils.storeData('collegeData', dispatch_data);
        Utils.storeData('cometchat_feedback_uid', college_data.data[0]?.cometchat_feedback_uid)
        dispatch(setInstituteInfo(dispatch_data));
        setOtpCode("");
        result.data.is_profile_complete == 1 ?
            props.navigation.replace('AmbassadorStack', { screen: 'BottomTabsNavigator' })
            : props.navigation.replace('CompleteProfile', { email: props.route.params.email, uid: cometchatUID })
    }
    function createUserAndLogin(comet_user: any, authKey: any, result: any, collegeId: any, ambassadorId: any, college_data: any, dispatch_data: any) {
        CometChat.createUser(comet_user, authKey)
            .then(
                user => {
                    cometChatLogin(result, authKey, collegeId, ambassadorId, college_data, dispatch_data);
                },
                error => {
                    console.log("error", error);
                }
            )
            .catch(e => {
                console.log("Error--------->", e);
            });
    }
    const data = (collegeId: any, result: any) => {
        let s = {
            college_id: collegeId,
            cometchat_uid: result.data.cometchat_uid,
            email: result.data.email,
            first_name: result.data?.user_detail?.first_name,
            isMentorProfileComplete: result.data.is_profile_complete,
            last_name: result.data.user_detail.last_name,
            middle_name: result.data.user_detail.middle_name,
            nationality: result.data.user_detail.country,
            profile_image: result.data.user_detail.profile_image,
            role_id: result.data.role_id,
            token: result.data.accessToken,
            user_id: result.data.id
        }
        return s
    }
    async function createCometUserAndLogin(s: any, authKey: any, result: any, props: any, collegeId: any, ambassadorId: any, college_data: any, dispatch_data: any) {
        try {
            await AuthAPIServices.create_cometchat_uid(s).then((o: any) => {
                console.log("ooooooooo------>", o)
                let comet_user = new CometChat.User(o.data.cometchat_uid);
                let tags: Array<any> = ["ambassador", `ambassador-${college_data.data[0]?.slug}`, college_data.data[0]?.slug];
                let n = AuthAPIServices.encrypt(result.data.user_detail?.first_name);
                comet_user.setName(n)
                comet_user.setTags(tags);
                CometChat.createUser(comet_user, authKey).then(
                    user => {
                        cometChatLoginAndRedirect(o.data.cometchat_uid, authKey, result, props, collegeId, ambassadorId, college_data, dispatch_data);
                    }, error => {
                        console.log("error", error);
                    }
                ).catch(e => {
                    console.log("Error--------->", e);
                })

            })
        } catch (error) {
            console.log("Error creating CometChat UID:", error);
        }
    }

    const screenWidth = Dimensions.get('window').width

    const ambassadorOtp = async (otp: any) => {
        Keyboard.dismiss()
        try {
            setIsLoading(true);
            const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
            if (otp.trim().length == 4) {
                await AuthAPIServices.ambassador_otp_verification(otp).then(async (res: any) => {
                    let collegeId: number = 0
                    let ambassadorId: number = 0
                    let userDetailsId: number = 0
                    if (res.data.college_id.length > 1) {
                        collegeId = res.data.college_id[res.data.college_id.length - 1]
                    } else if (res.data.college_id.length == 1) {
                        collegeId = res.data.college_id[0];
                    }
                    if (res.data.id.length > 1) {
                        ambassadorId = res.data.id[res.data.id.length - 1]
                    } else if (res.data.id.length == 1) {
                        ambassadorId = res.data.id[0];
                    }
                    if (res.data.user_details_id.length > 1) {
                        userDetailsId = res.data.user_details_id[res.data.user_details_id.length - 1]
                    } else if (res.data.user_details_id.length == 1) {
                        userDetailsId = res.data.user_details_id[0];
                    }

                    if (res.statusCode == 200) {
                        let result: any = await college_login(collegeId);
                        if (result.statusCode == 200) {
                            let college_data: any = await getCollegeData(collegeId)
                            let dispatch_data = {
                                item: res.data,
                                college_data: college_data.data
                            }
                            if (result.data.is_profile_complete == 1) {
                                if (college_data.statusCode == 200) {
                                    if (result.data.cometchat_uid) {
                                        cometChatLoginAndRedirect(result.data.cometchat_uid, authKey, result, props, collegeId, ambassadorId, college_data, dispatch_data)
                                    } else {
                                        if (college_data.statusCode == 200) {
                                            let s = data(collegeId, result)
                                            createCometUserAndLogin(s, authKey, result, props, collegeId, ambassadorId, college_data, dispatch_data)
                                        }
                                    }
                                }
                            } else {
                                if (result.data.cometchat_uid) {
                                    cometChatLoginAndRedirect(result.data.cometchat_uid, authKey, result, props, collegeId, ambassadorId, college_data, dispatch_data)
                                } else {
                                    if (college_data.statusCode == 200) {
                                        let s = data(collegeId, result)
                                        createCometUserAndLogin(s, authKey, result, props, collegeId, ambassadorId, college_data, dispatch_data)
                                    }
                                }
                            }
                        }
                    } else {
                        setHasErr(true);
                        setWrongOtp(true);
                        setIsLoading(false)
                    }
                })
            } else {
                setHasErr(true);
                setWrongOtp(true);
                setIsLoading(false)
            }
        } catch (error) {
            setHasErr(true);
            setIsLoading(false);
        }
    }

    const setText = (e: any) => {
        // otpInput.current.setOtpCode(e);
        setOtpCode(e)
    }

    const onResendPress = async () => {
        setHasErr(false)
        setOtpCode('')
        otpInput.current.clear()
        setResendLoading(true);
        try {
            await AuthAPIServices.login(props.route.params.email).then((res: any) => {
                if (res.statusCode === 200) {
                    Utils.storeData('app_token', res.data.app_token)
                    setResendLoading(false);
                    setCount(60);
                    setCountInterval();
                } else {
                    setResendLoading(false);
                    ToastAndroid.showWithGravity(
                        res.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            })
        } catch (error) {
            console.log(error);
            setResendLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex flex-1 bg-white'>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='always' >
                <View className='flex w-full justify-center items-center'>
                    <View className='w-[200px] h-[133px] mt-10'>
                        <FastImage source={Images.truleaguelogo} resizeMode='contain' className='w-full h-full' />
                    </View>
                </View>
                <View className='px-5 flex flex-auto'>
                    <View className='mt-5'>
                        <Text className='text-textColor text-[34px]  font-Helvetica'>Enter OTP</Text>
                    </View>
                    <View className='mt-3 flex-row relative'>
                        <Text className='text-textColor text-[16px] tracking-[0.44px] leading-4 font-InterMedium'>Please enter the OTP we’ve sent you on {props.route.params.email}</Text>
                    </View>
                    <View style={OtpStyle.container} >
                        <View className='mt-7 h-[100px] w-[300px]'>
                            <OtpInput
                                ref={otpInput}
                                focusColor={Colors.textColor}
                                onTextChange={(e) => {
                                    if ((e + "") !== 'NaN') {
                                        if (
                                            (e + "").indexOf(" ") !== -1 ||
                                            (e + "").indexOf(",") !== -1 ||
                                            (e + "").indexOf(".") !== -1 ||
                                            (e + "").indexOf("-") !== -1
                                        ) {
                                            otpInput.current.setValue(parseInt(e + "") + "")
                                        } else {
                                        }
                                    } else {
                                        otpInput.current.clear()
                                    }
                                    if (e.length !== 4) {
                                        setHasErr(false)
                                        setOtpCode('')
                                    }
                                }}
                                onFilled={(e) => {
                                    if (hasErr == false) {
                                        props.route.params.role_id == 5 ? prospectOtp(e) : ambassadorOtp(e)
                                    }
                                    setOtpCode(e)
                                }}
                                numberOfDigits={4}
                                theme={{
                                    pinCodeContainerStyle: {
                                        width: 62,
                                        height: 60,
                                        borderRadius: 4,
                                        backgroundColor: Colors.fieldGrayColor,
                                        borderColor: hasErr ? Colors.errorColor : Colors.fieldGrayColor
                                    }, focusedPinCodeContainerStyle: { borderColor: hasErr ? Colors.errorColor : Colors.fieldGrayColor },
                                    pinCodeTextStyle: { color: hasErr ? Colors.errorColor : Colors.textColor, fontWeight: '400', fontSize: 14 }
                                }}
                            />
                            <View className={`${hasErr ? 'justify-between' : 'justify-end'} items-center py-3  flex-row pr-2`}>

                                {hasErr ? (
                                    <Text className={`${hasErr ? 'text-errorColor' : 'text-fieldTextColor'} text-[12px] tracking-[0.44px] leading-5 font-InterRegular`}>Incorrect OTP entered</Text>
                                ) : null}
                                <View className='' style={{}}>
                                    {
                                        count == 0 ?
                                            resendLoading ?
                                                <ActivityIndicator size={'small'} color={Colors.textColor} />
                                                :
                                                <TouchableOpacity onPress={onResendPress}>
                                                    <Text className='text-textColor text-[14px] tracking-[0.44px] leading-5 font-InterMedium'>
                                                        Resend
                                                    </Text>
                                                </TouchableOpacity>
                                            :
                                            <Text className='text-textColor text-[14px] tracking-[0.44px] leading-5 font-InterMedium'>
                                                {' '}
                                                00:{count < 10 ? '0' + count : count}
                                            </Text>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <View className='flex px-5 pb-3'>
                {
                    isLoading ?
                        <ActivityIndicator size={'large'} style={{}} color={Colors.textColor} />
                        :
                        (otpCode === '' || otpCode === null)
                            ?
                            <GradientButton
                                text="Verify OTP"
                                colors={['#1B1869', '#8C126E']}
                                disable={true}
                            />
                            :

                            <GradientButton
                                onPress={() => props.route.params.role_id == 5 ? prospectOtp(otpCode) : ambassadorOtp(otpCode)}
                                text="Verify OTP"
                                colors={['#1B1869', '#8C126E']}
                                disable={false}
                            />
                }
            </View>
        </KeyboardAvoidingView>
    )
}

const OtpStyle = StyleSheet.create({
    keyCode: {
        backgroundColor: 'white',
        borderRadius: 4,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        color: 'rgba(0,0,0,1)',
        alignSelf: 'center',
        fontFamily: Fonts.InterMedium,
    },
    container: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        marginHorizontal: ScreenWidth * 4 / 100
    },
    box: {
        width: 62,
        height: 60,
        marginHorizontal: 5,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    roundedTextInput: {
        borderRadius: 4,
        height: 60,
        width: 62,
        backgroundColor: Colors.fieldGrayColor,
        borderBottomWidth: 0
    }
});
export default Otp