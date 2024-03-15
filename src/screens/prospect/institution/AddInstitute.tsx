import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import FastImage from 'react-native-fast-image'
import { Icons } from '../../../assets/Images'
import { Colors } from '../../../common/Colors'
import { KeycodeInput } from '../../../components/KeyCodeInput/KeyCode'
import { Fonts } from '../../../common/Fonts'
import GradientButton from '../../../components/Gradientbtn'
import * as instituteServices from '../../../services/prospect/institutes/InstituteServices'
import { OtpInput } from 'react-native-otp-entry'
import { useIsFocused } from '@react-navigation/native'


const AddInstitute = (props: any) => {
    const scrollViewRef: any = useRef<ScrollView>(null);
    let otpInput: any = useRef(null);
    const isFocused = useIsFocused();
    const [otpCode, setOtpCode] = useState('');
    const [hasBtnDisable, setBtnDisable] = useState(true);
    const [wrongOtp, setWrongOtp] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [hasErr, setHasErr] = useState(false);


    function btn_visible() {
        setBtnDisable(false)
    }
    function btn_invisible() {
        setBtnDisable(false)
    }
    useEffect(() => {
        if (otpCode.length < 5 && wrongOtp) {
            setWrongOtp(false);
        }
    }, [otpCode]);

    useEffect(() => {        
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 500, animated: true });
        }
    }, [otpInput,isFocused,OtpInput])

    const handleButtonPress = async () => {
        setIsLoading(true);
        try {
            if (otpCode.trim().length == 5) {
                await instituteServices.code_verification(otpCode).then((res: any) => {
                    if (res.statusCode == 200) {
                        setHasErr(false);
                        setWrongOtp(false);
                        setIsLoading(false)
                        setOtpCode('')
                        props.navigation.navigate('Signup', { data: res.data })
                        otpInput.current.clear()
                    } else {
                        setHasErr(true);
                        setWrongOtp(true);
                        setIsLoading(false)
                        scrollViewRef.current.scrollTo({ y: 500, animated: true });
                    }
                })
            } else {
                setHasErr(true);
                setWrongOtp(true);
                setIsLoading(false)
                scrollViewRef.current.scrollTo({ y: 500, animated: true });
            }
        } catch (error) {
            setHasErr(true);
            setIsLoading(false);
        }
    }


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='flex flex-1 px-3 bg-fieldGrayColor'>
            <View className='flex flex-row items-center mt-10'>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
                    <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.textColor} />
                </TouchableOpacity>
                <Text className='text-textColor text-[24px] font-Helvetica ml-1'>Add new institution</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} ref={scrollViewRef}>
                <View className='px-3 mt-20 flex flex-auto'>
                    <Text className='text-textColor text-[27px] font-Helvetica'>Enter Code</Text>
                    <Text className='text-textColor text-[16px] font-normal leading-4 tracking-[0.44px] mt-3'>Enter the five-digit code provided by your institution.</Text>
                    <Text className='text-greyBorder text-[16px] font-normal leading-4 tracking-[0.44px] mt-3 opacity-70'>If you don't have a code, please ask the institution you want to add for the TruLeague code.</Text>
                    <View className='mt-7'>
                        <OtpInput
                            ref={otpInput}
                            focusColor={Colors.textColor}
                            autoFocus={true}
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
                            }}
                            onFilled={(e) => {                                
                                setOtpCode(e)
                            }}
                            numberOfDigits={5}
                            theme={{
                                inputsContainerStyle: {
                                    width: '100%',
                                    paddingHorizontal: 2
                                },
                                containerStyle: {
                                    marginHorizontal: 1,
                                },
                                pinCodeContainerStyle: {
                                    margin: 2,
                                    width: 58,
                                    height: 60,
                                    borderRadius: 4,
                                    backgroundColor: Colors.fieldGrayColor,
                                    borderColor: hasErr ? Colors.errorColor : Colors.fieldGrayColor
                                }, focusedPinCodeContainerStyle: { borderColor: hasErr ? Colors.errorColor : Colors.fieldGrayColor },
                                pinCodeTextStyle: { color: hasErr ? Colors.errorColor : Colors.textColor, fontWeight: '400', fontSize: 14 }
                            }}
                        />
                    </View>
                    {wrongOtp ?
                        <Text className={`${wrongOtp ? 'text-errorColor' : ''} text-[14px] tracking-[0.44px] ml-2 leading-5 font-normal mt-[6px] mb-2`}>Incorrect code entered</Text>
                        : null}
                </View>
            </ScrollView>

            <View className='flex px-3 mb-3'>
                {
                    (otpCode === '' || otpCode === null) ?
                        <View className='opacity-50'>
                            <GradientButton
                                // onPress={handleButtonPress}
                                text="Verify code and add institution"
                                colors={['#1B1869', '#8C126E']}
                                disable={true}
                            />
                        </View>
                        :
                        isLoading ?
                            <ActivityIndicator size={'large'} color={Colors.textColor} />
                            :
                            <View className=''>
                                <GradientButton
                                    onPress={handleButtonPress}
                                    text="Verify code and add institution"
                                    colors={['#1B1869', '#8C126E']}
                                    disable={false}
                                />
                            </View>
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
});
export default AddInstitute