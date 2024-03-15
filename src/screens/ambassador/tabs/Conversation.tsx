import { View, BackHandler, PermissionsAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { CometChatConversationListWithMessages } from '../../../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Chats'
import CustomModal from '../../../components/CustomModal'
import { useIsFocused } from '@react-navigation/native'


const Conversation = (props: any) => {
  const isFocused = useIsFocused();
  const [AwesomeModal, setAwesomeModal] = useState(false)

  useEffect(() => {
    requestNotificationPermission();
  }, [isFocused])

  // useEffect(() => {
  //   if (!props.navigation.canGoBack() || props.navigation.canGoBack()) {
  //     const backAction = () => {
  //       // setAwesomeModal(true)

  //       return true;
  //     };
  //     const backHandler = BackHandler.addEventListener(
  //       'hardwareBackPress',
  //       () => true,
  //     );
  //     return () => backHandler.remove();
  //   }
  // }, [!props.navigation.canGoBack()]);

  const onYesClick = () => {
    BackHandler.exitApp();
    setAwesomeModal(false);
  }

  const closeModal = () => {
    setAwesomeModal(false);
  }

  const requestNotificationPermission = async () => {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      ]
      );
      // if (
      //   grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
      //   PermissionsAndroid.RESULTS.GRANTED &&
      //   grants['android.permission.READ_EXTERNAL_STORAGE'] ===
      //   PermissionsAndroid.RESULTS.GRANTED
      // ) {
      //   // console.log('You can use the camera');
      // } else {
      //   // console.log('Camera permission denied');
      // }
    } catch (err) {
      console.warn(err);
    }
  };


  return (
    <View className='flex flex-1'>
      {
        AwesomeModal ?
          <CustomModal closeModal={closeModal} no={'Cancel'} yes={"Exit"} title={'Are you Leaving?'} message={'Are you sure,you want to exit?'} AwesomeModal={AwesomeModal} onYesClick={onYesClick} setAwesomeModal={setAwesomeModal} />
          : null
      }
      <CometChatConversationListWithMessages navigation={props.navigation} />
    </View>
  )
}

export default Conversation