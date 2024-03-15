import { View, Text, TouchableOpacity, Image, BackHandler, InteractionManager } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Icons } from '../../../assets/Images'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'
import { setUserInfo } from '../../../redux/action/UserAction'
import { Utils } from '../../../common/Utils'
import { Colors } from '../../../common/Colors'
import { COMETCHAT_CONSTANTS, SUPER_ADMIN_ID, cometchat_feedback_uid } from '../../../CONSTS'
import { CometChat } from '@cometchat-pro/react-native-chat'
import * as AuthServices from '../../../services/auth/AuthServices';
import CustomModal from '../../../components/CustomModal'
import MenuFoolter from '../../../components/MenuFoolter'
import { useDebounce } from '../../../common/CommonFunctions'
import { setLoginTypeInfo } from '../../../redux/action/LoginTypeAction'


const AmbassadorMenu = (props: any) => {
  const [AwesomeModal, setAwesomeModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [disable, setDisabled] = useState(false)
  const dispatch = useDispatch();
  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })
  const primaryColor = instituteInfo.college_data[0].font_color;

  useEffect(() => {
    if (disable) {
      setTimeout(() => {
        setDisabled(false)
      }, 2000)
    }
  }, [disable])

  const logout = async () => {
    setIsLoading(true);
    try {
      let response: any = await AuthServices.logout();
      if (response.statusCode == 200) {
        CometChat.logout().then(async (o) => {
          dispatch(setLoginTypeInfo(true))
          await Utils.clearAllData()
          props.navigation.replace('AuthStack', { screen: 'Login' })
          setIsLoading(false);
          setAwesomeModal(false);
        })
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setAwesomeModal(false);
    }
  }

  const tech_support = async () => {
    setDisabled(true)
    const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
    let comet_chat_uid = await Utils.getData('ambassador_cometchat_uid');
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
                  setDisabled(false)
                }, 2000)
                // InteractionManager.runAfterInteractions(() => {
                //   setTimeout(() => {
                //   }, 1000)
                // })
              })
              .catch(
                err => console.error("Error while fetching blocked users list:", err)
              );
          }
        }, error => {
          console.log("Something went wrong", error);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }


  const closeModal = () => {
    setAwesomeModal(false)
  }

  const admin_chat = async () => {
    setDisabled(true)
    const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
    // let comet_chat_uid = instituteInfo.college_data[0]?.cometchat_feedback_uid;
    let comet_chat_uid = await cometchat_feedback_uid();
    let collegeData = await Utils.getData('collegeData');
    let college_name = collegeData.college_data[0]?.name
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
            fetch(`https://${COMETCHAT_CONSTANTS.APP_ID}.api-us.cometchat.io/v3/users?searchKey=${comet_chat_uid}&perPage=100&page=1`, options)
              .then(response => response.json())
              .then(response => {
                let d = {
                  blockedByMe: false,
                  deactivatedAt: 0,
                  hasBlockedMe: false,
                  lastActiveAt: response?.data[0]?.lastActiveAt,
                  role: response?.data[0]?.role,
                  status: response?.data[0]?.status === 'available' ? 'online' : response?.data[0]?.status,
                  name: response?.data[0]?.name,
                  feedback_uid: comet_chat_uid
                }
                // props.navigation.navigate('CometChatConversationListWithMessages', { type: 'user', loggedInUser: { ...user, ...d } })
                InteractionManager.runAfterInteractions(() => {
                  setTimeout(() => {
                    props.navigation.navigate('CometChatConversationListWithMessages', { type: 'user', loggedInUser: { ...user, ...d }, admin: 'ADMIN_CHAT', college_name: college_name })
                    setDisabled(false)
                  }, 1000)
                })
              })
              .catch(
                err => console.error("Error while fetching blocked users list:", err)
              );
          }
        }, error => {
          console.log("Something went wrong", error);
        }
      );
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <View className='flex flex-1 bg-fieldGrayColor'>
      <View className={`flex flex-row items-center px-2 py-5`} style={{ backgroundColor: primaryColor }}>
        <TouchableOpacity onPress={() => { props.navigation.goBack() }}>
          <FastImage source={Icons.IcBackBtn} className='w-[42px] h-[42px]' tintColor={Colors.white} />
        </TouchableOpacity>
        <Text className='text-whiteColor text-[20px] leading-8 tracking-[0.44px] font-Helvetica ml-1'>{' '}Menu{' '}</Text>
      </View>
      <View className='flex flex-auto'>
        <TouchableOpacity className='flex flex-row border-b-[1px] border-b-greyColor25 px-5 py-6' onPress={() => { props.navigation.navigate('AmbassPrfoile') }}>
          {/* <FastImage source={Icons.IcUser} resizeMode='center' className='w-[30px] h-[30px]' tintColor={Colors.primaryColor} /> */}
          {/* <Image source={Icons.IcUser} style={{width:50,height:50}} resizeMode='contain'/> */}
          <Text className='text-textColor text-xl font-Helvetica  ml-8'>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={disable} className='flex flex-row border-b-[1px] border-b-greyColor25 px-5 py-6' onPress={admin_chat}>
          {/* <FastImage source={Icons.IcUser} resizeMode='center' className='w-[30px] h-[30px]' tintColor={Colors.primaryColor} /> */}
          <Text className='text-textColor text-xl font-Helvetica  ml-8'>Admin Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity disabled={disable} className='flex flex-row border-b-[1px] border-b-greyColor25 px-5 py-6' onPress={tech_support}>
          {/* <FastImage source={Icons.IcSupportIcon} resizeMode='center' className='w-[30px] h-[30px]' tintColor={Colors.primaryColor} /> */}
          <Text className='text-textColor text-xl font-Helvetica  ml-8'>Tech Support</Text>
        </TouchableOpacity>
      </View>
      {

        AwesomeModal ?
          <CustomModal AwesomeModal={AwesomeModal} isLoading={isLoading} no={'Keep me logged in'} yes={'Yes, logout'} title={'Are you leaving?'} onYesClick={logout} message={'Are you sure,you want to logout?'} closeModal={closeModal} />
          : null
      }

      {/* <TouchableOpacity
        onPress={() => setAwesomeModal(true)}
        className='flex flex-row border-t-[1px] border-t-greyColor25 px-5 py-6 items-center'>
        <Text className='text-errorColor text-xl font-Helvetica  ml-8'>Log out</Text>
      </TouchableOpacity> */}
      <MenuFoolter setAwesomeModal={setAwesomeModal} logoutIcon={false} />

    </View>
  )
}

export default AmbassadorMenu