import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, ToastAndroid, Linking, ScrollView, Dimensions, BackHandler, Keyboard } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import FastImage from 'react-native-fast-image'
import { Images } from '../../assets/Images'
import { Colors } from '../../common/Colors'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import GradientButton from '../../components/Gradientbtn'
import { EmailValidator, PasswordValidator } from '../../common/Validators'
import { useDispatch,useSelector } from 'react-redux';
import { CometChat } from "@cometchat-pro/react-native-chat";
import { COMETCHAT_CONSTANTS, TERMS_AND_CONDITIONS } from '../../CONSTS'
import * as AuthAPIServices from '../../services/auth/AuthServices'
import { Utils } from '../../common/Utils'
import messaging from '@react-native-firebase/messaging';
import analytics, { firebase } from '@react-native-firebase/analytics';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Fonts } from '../../common/Fonts'
import { setLoginTypeInfo } from '../../redux/action/LoginTypeAction'

const appID = COMETCHAT_CONSTANTS.APP_ID;
const region = COMETCHAT_CONSTANTS.REGION;

const appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();



const Login = (props: any) => {
  const dispatch = useDispatch();
  const scrollViewRef: any = useRef<ScrollView>(null);
  const [email, setEmail] = useState('')
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [hasError, setHasError] = useState(false);
  // const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const animation = useSharedValue(0);
  const textAnimation = useSharedValue(0);
  const [toggle, setToggle] = useState(false);
  const [toggleDisable, setToggleDisable] = useState(false)
  const ScreenWidth = Dimensions.get('window').width;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: animation.value }]
    }
  })

  const loginTypeInfo = useSelector((state:any) =>{
    return state.loginTypeReducer?.loginType
  })

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textAnimation.value }]
    }
  })

  useEffect(()=>{
    setToggle(loginTypeInfo)
  },[loginTypeInfo])

  const click_toggle = () => {
    if (animation.value == 0) {
      animation.value = withTiming(85, { duration: 0 })
      textAnimation.value = withTiming(-30, { duration: 0 })
    } else {
      animation.value = withTiming(0, { duration: 0 })
      textAnimation.value = withTiming(0, { duration: 0 })
    }
    setToggle(!toggle)
    setHasError(false);
    setEmail('');
  }

  const onChangeEmail = (e: any) => {
    let isValid = EmailValidator(e)
    if (e === '' || e === null) {
      setIsValidEmail(false);
      setHasError(false)
    }
    setEmail(e);

  }

  useEffect(() => {
    if (!props.navigation.canGoBack()) {
      const backAction = () => {
        BackHandler.exitApp()
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [props.navigation.canGoBack()]);





  const handleButtonPress = async () => {
    setLoading(true)
    setToggleDisable(true);
    Keyboard.dismiss()
    const validEmail = EmailValidator(email);
    // const isValidPassword = PasswordValidator(password)
    // const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
    // const uid = '0000cuniva60';
    try {
      if (validEmail) {
        await AuthAPIServices.login(email).then(async (res: any) => {
          if (res.statusCode == 200) {
            let fcm_token = await messaging().getToken();
            let send_data = {
              email: email,
              college_id: res.data.college_id,
              fcm_token: fcm_token
            }
            Utils.storeData('app_token', res.data.app_token)
            CometChat.init(appID, appSetting).then(
              () => {
                console.log('Initialization completed successfully');
              },
              (error) => {
                console.log('Initialization failed with error:', error);
              },
            );
            props.navigation.navigate('Otp', { role_id: res.data.role, email: email })
            setLoading(false)
            setToggleDisable(false);
          } else {
            setLoading(false);
            setToggleDisable(false);
           
           
          }
        })
      } else {
        setHasError(true);
        setLoading(false);
        setToggleDisable(false);
      }
    } catch (error) {
      console.log(error);
    }

  };




  const ambassadorLogin = async () => {
    Keyboard.dismiss()
    setLoading(true)
    setToggleDisable(true);
    const validEmail = EmailValidator(email);
    let trim_mail = email.trim();
    try {
      if (validEmail) {
        await AuthAPIServices.ambassador_login(trim_mail).then(async (res: any) => {
          if (res.statusCode == 200) {
            let fcm_token = await messaging().getToken();
            let send_data = {
              email: email,
              college_id: res.data.college_id,
              fcm_token: fcm_token
            }
            Utils.storeData('app_token', res.data.app_token)
            CometChat.init(appID, appSetting).then(
              () => {
                console.log('Initialization completed successfully');
              },
              (error) => {
                console.log('Initialization failed with error:', error);
              },
            );
            let response: any = await AuthAPIServices.store_fcm_toke(send_data);
            if (response.statusCode == 202) {
              console.log(response.message);
            }
            dispatch(setLoginTypeInfo(toggle))
            props.navigation.navigate('Otp', { role_id: res.data.role, email: email, college_id: res.data.college_id })
            setLoading(false)
            setToggleDisable(false);
          } else {
            setLoading(false);
            setToggleDisable(false);
            ToastAndroid.showWithGravity(
              res.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            );
          }
        })
      } else {
        setHasError(true);
        setLoading(false);
        setToggleDisable(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const openWebsite = (url: any) => {
    Linking.openURL(url)
      .catch((err) => console.error('An error occurred:', err));
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex flex-1 bg-bgGrayColor'>
      <View className='px-4 bg-bgGrayColor'>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' ref={scrollViewRef}>
          <View className='flex w-full justify-center items-center'>
            <View className='w-[200px] h-[133px] mt-10'>
              <FastImage source={Images.truleaguelogo} resizeMode='contain' className='w-full h-full' />
            </View>
          </View>
          <View className='flex flex-row justify-between items-center' style={{ width: (ScreenWidth - 35) }}>
            <View className={`mt-10 flex flex-1`} >
              <Text className='text-textColor text-[30px] font-Helvetica tracking-[0.15px] leading-[44px] font-semibold'>{toggle ? 'Ambassador’s \nLogin' : 'Login'}</Text>
            </View>
          </View>
          <View className={`ml-1 ${toggle ? 'mt-[30px]' : 'mt-[30px]'} `}>
            <Text className='text-textColor text-[14px] font-normal'>Email</Text>
          </View>
          <View className={`flex mt-1 w-full rounded-[4px] justify-center items-center ${hasError ? 'border-[1px] border-errorColor' : 'border-none'}`}>
            <TextInput
              className={`w-full h-[50px] ${hasError ? 'text-errorColor' : 'text-fieldTextColor'}  leading-4 bg-fieldGrayColor px-3 rounded-[4px] font-Helvetica`}
              value={email}
              keyboardType="email-address"
              textContentType={'emailAddress'}
              placeholder='Enter your email ID'
              autoCapitalize='none'
              onChangeText={(e) => { onChangeEmail(e) }}
              placeholderTextColor={Colors.greyBorder}
              autoComplete='off'
              onFocus={() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 500, animated: true });
                }
              }}
            />
          </View >
          {
            hasError ?
              <Text className={`${hasError ? 'text-errorColor' : 'text-fieldTextColor'} text-[12px] tracking-[0.44px] leading-5 font-normal`}>Incorrect email ID entered</Text>
              : <></>
          }

          <View className='mt-5 w-full flex flex-row justify-center items-center'>
            {
              checked ?
                <TouchableOpacity onPress={() => setChecked(false)} className=''><AntDesign name='checksquare' size={19} color={Colors.textColor} style={{ height: 19, width: 19, borderRadius: 2 }} /></TouchableOpacity> :
                <TouchableOpacity onPress={() => setChecked(true)}><View className='border-[1.5px] h-[17px] w-[17px] mt-[1px] ml-[1px] border-textColor  rounded-sm '></View></TouchableOpacity>
            }
            <View className='w-[80%] flex flex-row ml-2 items-center flex-wrap'>
              <Text className='text-textColor text-[12px] tracking-[0.15px] leading-5'>I agree to the</Text>
              <TouchableOpacity onPress={() => { openWebsite(TERMS_AND_CONDITIONS.PRIVACY_POLICY) }}>
                <Text className='text-primaryColor text-[12px] tracking-[0.15px] leading-5'> privacy policy </Text>
              </TouchableOpacity>
              <Text className='text-textColor text-[12px] tracking-[0.15px] leading-5'>&</Text>
              <TouchableOpacity onPress={() => { openWebsite(TERMS_AND_CONDITIONS.TERMS) }}>
                <Text className='text-primaryColor text-[12px] ml-1 tracking-[0.15px] leading-5'>
                  terms of use.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className={`${hasError ? 'mt-4' : 'mt-7'}`}>
            {
              loading ?
                <ActivityIndicator size={'large'} style={{}} color={Colors.textColor} />
                :
                (email === null || email === '' || checked == false) ?
                  <GradientButton
                    text="Login"
                    colors={['#1B1869', '#8C126E']}
                    disable={true}
                  />
                  :
                  <GradientButton
                    onPress={toggle ? ambassadorLogin : handleButtonPress}
                    text="Login"
                    colors={['#1B1869', '#8C126E']}
                    disable={false}
                  />
            }
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }} className='mt-[35px]'>
            <View style={{ flex: 1, height: 1, backgroundColor: '#A6A8D680' }} className='mx-[3px]'/>
            <View>
              <Text style={{ width: 50, textAlign: 'center',color:'#1B1869' }} className='text-[14px]' >OR</Text>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: '#A6A8D680' }} className='mx-[3px]' />
          </View>
          <TouchableOpacity onPress={click_toggle} className='flex border-[1.2px] mt-[35px] h-[60px] justify-center items-center self-stretch border-[#1B1869] rounded-[4px] ' >
            {
              toggle ? <Text className='text-[#1B1869] font-HelveticaMedium text-[16px] leading-[16px] '>Sign in as prospect</Text> : <Text className='text-[#1B1869] font-HelveticaMedium text-[16px] leading-[16px] ' >Sign in as ambassador</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView >
  )
}


const styles = StyleSheet.create({
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: 'black'
  },
  button: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#cccccc',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  toggleChecked: {
    backgroundColor: '#1c7278',
  },
});
export default Login