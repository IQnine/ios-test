import React from 'react';
import { View, Text, TouchableWithoutFeedback, Alert,ToastAndroid, Linking } from 'react-native';
import CometChatThreadedMessageReplyCount from '../CometChatThreadedMessageReplyCount';
import CometChatReadReceipt from '../CometChatReadReceipt';
import { CometChatMessageReactions } from '../../Messages/Extensions';
import style from './styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from 'rn-fetch-blob';
import * as enums from '../../../utils/enums';
import * as actions from '../../../utils/actions';
import { logger } from '../../../utils/common';

const CometChatSenderFileMessageBubble = (props) => {
  const message = { ...props.message, messageFrom: enums.MESSAGE_FROM_SENDER };

  /**
   * Handler to download the file attachment in local storage
   * @param
   */
  const download = () => {
    Linking.openURL(props.message.data.attachments[0].url)
  };
  return (
    <View style={style.container}>
      <TouchableWithoutFeedback
        onPress={download}
        onLongPress={() =>
          props.actionGenerated(actions.OPEN_MESSAGE_ACTIONS, message)
        }>
        <View style={style.messageWrapperStyle}>
          <View style={style.messageDetailContainer}>
            <Text style={style.messageTextStyle}>
              {props.message.data.attachments[0].name}
            </Text>
          </View>
          <Icon name="file-download-outline" size={24} color="#fff" />
        </View>
      </TouchableWithoutFeedback>
      <View style={style.messageInfoWrapperStyle}>
        <CometChatThreadedMessageReplyCount {...props} message={message} />
        <CometChatReadReceipt {...props} message={message} />
      </View>
      {/* <CometChatMessageReactions
        theme={props.theme}
        {...props}
        message={message}
        showMessage={props?.showMessage}
      /> */}
    </View>
  );
};
export default CometChatSenderFileMessageBubble;
