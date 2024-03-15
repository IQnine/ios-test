import { View, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import { CometChatConversationListWithMessages } from '../../../../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src'
import { useDispatch, useSelector } from 'react-redux'
import CustomModal from '../../../../components/CustomModal'


const ProspectConversations = (props: any) => {
  const [AwesomeModal, setAwesomeModal] = useState(false);

  const instituteInfo = useSelector((state: any) => {
    return state.instituteInfoReducer?.instituteInfo
  })


  useEffect(() => {
    if (!props.navigation.canGoBack()) {
      const backAction = () => {
        setAwesomeModal(true)
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }
  }, [props.navigation.canGoBack()]);


  const closeModal= () => {
    setAwesomeModal(false)
  }


  const onYesClick = () => {
    BackHandler.exitApp();
    closeModal()
  }
  
  return (
    <View className='flex flex-1'>
      <CometChatConversationListWithMessages navigation={props.navigation} collegeInfo={instituteInfo}/>
      {
        AwesomeModal ?
          <CustomModal title={'Are you leaving?'} closeModal={closeModal} no={'Cancel'}  yes={"Exit"} message={'Are you sure, you want to exit?'} AwesomeModal={AwesomeModal} onYesClick={onYesClick} setAwesomeModal={setAwesomeModal} />
          : null
      }
    </View>
  )
}

export default ProspectConversations