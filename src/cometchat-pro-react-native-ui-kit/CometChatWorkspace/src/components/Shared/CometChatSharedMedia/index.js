import { CometChat } from '@cometchat-pro/react-native-chat';
import _ from 'lodash';
import React from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View, ActivityIndicator, BackHandler } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import VideoPlayer from 'react-native-video-controls';
import theme from '../../../resources/theme';
import { CometChatContext } from '../../../utils/CometChatContext';
import { logger } from '../../../utils/common';
import { deviceHeight, heightRatio } from '../../../utils/consts';
import { CometChatManager } from '../../../utils/controller';
import * as enums from '../../../utils/enums';
import CometChatImageViewer from '../../Messages/CometChatImageViewer';
import CometChatVideoViewer from '../../Messages/CometChatVideoViewer'
import DropDownAlert from '../../Shared/DropDownAlert';
import { SharedMediaManager } from './controller';
import styles from './styles';
import { Icons, Images } from '../../../../../../assets/Images';
import { Colors } from '../../../../../../common/Colors';
import * as actions from '../../../utils/actions';
import { Utils } from '../../../../../../common/Utils';
import { color } from 'react-native-elements/dist/helpers';
import { Fonts } from '../../../../../../common/Fonts';
import * as AuthServices from '../../../../../../services/auth/AuthServices';
import { COMETCHAT_CONSTANTS, SUPER_ADMIN_ID } from '../../../../../../CONSTS';
import CustomModal from '../../../../../../components/CustomModal';
import { StackActions } from '@react-navigation/native';
import { store } from '../../../../../../redux/Store';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dimensions } from 'react-native';

export default class CometChatSharedMedia extends React.Component {
  static contextType = CometChatContext;
  primaryColor = '';
  user_details = '';
  admin_comet_chatuid = '';
  cometchat_feedback_uid = '';
  constructor(props) {
    super(props);
    // this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

    this.state = {
      messageType: CometChat.MESSAGE_TYPE.IMAGE,
      messageList: [],
      imageView: false,
      videoView: false,
      activeMessage: {},
      AwesomeModal: false,
    };

    this.messageContainer = React.createRef();
  }

  // backAction = () => {
  //   this.props.actionGenerated(actions.CLOSE_DETAIL)
  //   return true;
  // };

  componentDidMount() {
    // this.backHandler = BackHandler.addEventListener(
    //   'hardwareBackPress',
    //   this.backAction,
    // );
    this.getColor();
    this.SharedMediaManager = new SharedMediaManager(
      this.props.item,
      this.props.type,
      this.state.messageType,
      this.context,
    );
    this.getMessages();
    this.SharedMediaManager.attachListeners(this.messageUpdated);
  }

  // componentWillUnmount() {
  //   this.backHandler.remove();
  // }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messageType !== this.state.messageType) {
      this.SharedMediaManager = null;
      this.SharedMediaManager = new SharedMediaManager(
        this.props.item,
        this.props.type,
        this.state.messageType,
        this.context,
      );
      this.getMessages();
      this.SharedMediaManager.attachListeners(this.messageUpdated);
      this.getColor();
    }
  }
  getColor = async () => {
    this.user_details = await Utils.getData('user_details');
    this.admin_comet_chatuid = await Utils.getData('ambassador_cometchat_uid');
    this.cometchat_feedback_uid = await Utils.getData('cometchat_feedback_uid');
  }

  componentWillUnmount() {
    this.SharedMediaManager.removeListeners();
    this.SharedMediaManager = null;
  }

  /**
   * Handle listener actions on new message or message deletion
   * @param key: action name
   * @param message: message object
   */
  messageUpdated = (key, message) => {
    switch (key) {
      case enums.MESSAGE_DELETED:
        this.messageDeleted(message);
        break;
      case enums.MEDIA_MESSAGE_RECEIVED:
        this.messageReceived(message);
        break;
      default:
        break;
    }
  };

  /**
   * Update shared media view on message deleted
   * @param deletedMessage: message object
   */
  messageDeleted = (deletedMessage) => {
    const messageType = deletedMessage.data.type;
    if (
      this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
      deletedMessage.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
      deletedMessage.getReceiver().guid === this.props.item.guid &&
      messageType === this.state.messageType
    ) {
      const messageList = [...this.state.messageList];
      const filteredMessages = messageList.filter(
        (message) => message.id !== deletedMessage.id,
      );
      this.setState({ messageList: filteredMessages });
    }
  };

  /**
   * Update shared media view on message received
   * @param message: message object
   */
  messageReceived = (message) => {
    const messageType = message.data.type;
    if (
      this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiver().guid === this.props.item.guid &&
      messageType === this.state.messageType
    ) {
      let messages = [...this.state.messageList];
      messages = messages.concat(message);
      this.setState({ messageList: messages });
    }
  };

  /**
   * Retrieve message list according to logged in user
   * @param
   */
  getMessages = () => {
    new CometChatManager()
      .getLoggedInUser()
      .then((user) => {
        this.loggedInUser = user;
        this.SharedMediaManager.fetchPreviousMessages()
          .then((messages) => {
            let messageList = [...messages, ...this.state.messageList];
            messageList = _.uniqBy(messageList, 'id');
            messageList = messageList.sort((a, b) => b.id - a.id)
            this.setState({ messageList });
          })
          .catch((error) => {
            const errorCode = error?.message || 'ERROR';
            this.props?.showMessage('error', errorCode);
            logger(
              '[CometChatSharedMedia] getMessages fetchPrevious error',
              error,
            );
          });
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.props?.showMessage('error', errorCode);
        logger(
          '[CometChatSharedMedia] getMessages getLoggedInUser error',
          error,
        );
      });
  };

  get_decrypted_name = (name) => {
    let user_name = AuthServices.decrypt(name)
    return user_name
  }

  /**
   * Scroll to bottom
   * @param
   */
  scrollToBottom = () => {
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  };

  /**
   * Handle on end reached of shared media list
   * @param e: scroll event
   */
  handleScroll = (e) => {
    const top = Math.round(e.currentTarget.scrollTop) === 0;
    if (top && this.state.messageList.length) {
      this.getMessages();
    }
  };

  /**
   * Handle media message clicked from the list
   * @param type:media message clicked type
   */
  mediaClickHandler = (type) => {
    this.setState({ messageType: type, messageList: [] });
  };

  /**
   * Get active message type - Images or Videos or Files
   * @returns activeHeaderName for shared media
   */
  getActiveType = () => {
    if (this.state.messageType === CometChat.MESSAGE_TYPE.IMAGE) {
      return 'Photos';
    }
    if (this.state.messageType === CometChat.MESSAGE_TYPE.FILE) {
      return 'Docs';
    }
    return 'Videos';
  };

  /**
   * Handle opening image view on  click on particular image from message list
   * @param message: message object
   */
  showImageView = (message) => {
    this.setState({ imageView: true, activeMessage: message });
  };

  /**
   * Handle closing image view
   * @param
   */
  hideImageView = () => {
    this.setState({ imageView: false });
  };

  /**
  * Handle opening video view on  click on particular video from message list
  * @param message: message object
  */
  showVideoView = (message) => {
    this.setState({ videoView: true, activeMessage: message });
  };

  /**
   * Handle closing video view
   * @param
   */
  hideVideoView = () => {
    this.setState({ videoView: false });
  };

  /**
   * Return empty list component
   * @param
   */
  emptyListComponent = () => {
    return (
      <View style={styles.emptyComponentContainerStyle}>
        <View className='w-[100px] h-[100px]'>
          <FastImage source={Images.emptymedia} resizeMode='contain' className='w-full h-full' />
        </View>
        <Text
          style={
            styles.emptyComponentStyle
          }>
          {/* {`No ${this.getActiveType()}`} */}
          You haven’t shared any media yet
        </Text>
      </View>
    );
  };

  formatBytes = (bytes) => {
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " gb"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " mb"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " kb"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
  }

  closeModal = () => {
    this.setState({ AwesomeModal: false });
  }

  block = () => {
    this.props.actionGenerated(actions.BLOCK_USER);
    this.setState({ AwesomeModal: false })
  }
  unblock = () => {
    this.props.actionGenerated(actions.UNBLOCK_USER);
    this.setState({ AwesomeModal: false })
  }

  render() {
    const currentTheme = { ...theme, ...this.props.theme };
    const { messageType, messageList, imageView, videoView, activeMessage } = this.state;
    const bgColor = currentTheme.backgroundColor.lightGrey;
    const p_color = this.primaryColor;
    const template = (message) => {
      console.log(message.data.attachments[0].url);
      if (messageType === CometChat.MESSAGE_TYPE.IMAGE && message.data.url) {
        return (
          <TouchableOpacity
            style={[
              styles.itemStyle,
              {
                backgroundColor: bgColor,
                width: Dimensions.get('window').width / 3
              },
            ]}
            className='border-2 border-white'
            onPress={() => {
              this.showImageView(message);
            }}>
            <FastImage
              source={{ uri: message.data.url }}
              // style={styles.imageStyle}
              className='w-full h-full'
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>

        );
      }
      if (messageType === CometChat.MESSAGE_TYPE.VIDEO && message.data.url) {
        return (
          <View style={[styles.videoStyle]}>
            <VideoPlayer
              source={{ uri: message.data.url }}
              navigator={this.props.navigator}
              disableBack
              disableSeekbar
              disableFullscreen
              disableVolume
              style={[styles.videoPlayerStyle]}
              muted
              onError={() => { logger("error while loading video", JSON.stringify(message)) }}
              resizeMode="contain"
              controlTimeout={200}
              onShowControls={() => this.showVideoView(message)}
            />
          </View>
        );
      }
      if (
        messageType === CometChat.MESSAGE_TYPE.FILE &&
        message.data.attachments
      ) {
        return (
          <View className='mt-5 mx-5'>
            <TouchableOpacity
              style={[styles.fileItemStyle, { backgroundColor: Colors.bgGrayColor }]}
              onPress={() => Linking.openURL(message.data.attachments[0].url)}>
              {
                message.data.attachments[0].extension === 'pdf' ?
                  < FastImage source={Icons.IcPdf} className='w-[60px] h-[66px]' resizeMode={FastImage.resizeMode.cover} />
                  : message.data.attachments[0].extension === 'png' ?
                    <View className='w-[60px] h-[66px] items-center justify-center '><MaterialCommunityIcons name='file-png-box' size={55} color={this.props.color} /></View>
                    : message.data.attachments[0].extension === 'jpg' ?
                      <View className='w-[60px] h-[66px] items-center justify-center '><MaterialCommunityIcons className='h-full w-full' name='file-jpg-box' size={55} color={this.props.color} /></View>
                      : message.data.attachments[0].extension === 'xlsx' ?
                        <View className='w-[60px] h-[66px] items-center justify-center'><FontAwesome5 name='file-excel' size={45} color={Colors.green} /></View>
                        : null
              }
              <View className='flex flex-col'>
                <Text
                  // ellipsizeMode='middle'
                  numberOfLines={1}
                  style={[
                    styles.fileStyle,
                    // { color: `${currentTheme.color.primary}` },
                    { color: Colors.textColor }
                  ]}>
                  {message.data.attachments[0].name.split('.')[0]}
                </Text>
                <View className='flex flex-row items-center'>
                  <Text
                    style={{ color: Colors.greyBorder, fontSize: 12, fontFamily: Fonts.InterRegular, fontWeight: '400' }}>
                    {this.formatBytes(message.data.attachments[0].size)}
                  </Text>
                  <View className='w-1 h-1 rounded-full bg-greyBorder mx-1'></View>
                  <Text
                    className='uppercase'
                    style={{ color: Colors.greyBorder, fontSize: 12, fontFamily: Fonts.InterRegular, fontWeight: '400', marginLeft: 3 }}>
                    {message.data.attachments[0].extension}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      }
    };
    const messages = [...messageList];
    return (
      <View style={[styles.sectionStyle, {}]}>
        {imageView ?
          <CometChatImageViewer
            open={imageView}
            color={this.props.color}
            close={this.hideImageView}
            message={activeMessage}
          /> : null}
        {videoView ?
          <CometChatVideoViewer
            color={this.props.color}
            open={this.state.videoView}
            close={this.hideVideoView}
            message={activeMessage}
          /> : null}

        <View className='flex flex-row  w-full px-5 py-5 items-center' style={{ backgroundColor: this.props.color }} >
          <TouchableOpacity onPress={() => { this.props.actionGenerated(actions.CLOSE_DETAIL) }}>
            <FastImage source={Icons.IcBackBtn} className='w-[25px] h-[30px]' tintColor={Colors.white} />
          </TouchableOpacity>
          <Text
            style={[
              styles.sectionHeaderStyle,
              {
                // color: currentTheme.color.helpText,
                color: Colors.white
              },
            ]}>
            Shared items
          </Text>
        </View>
        <View className='' style={[styles.sectionContentStyle, { flex: 3 }]}>
          <View style={styles.mediaBtnStyle}>
            <TouchableOpacity
              onPress={() =>
                this.mediaClickHandler(CometChat.MESSAGE_TYPE.IMAGE)
              }
              style={[
                messageType === CometChat.MESSAGE_TYPE.IMAGE
                  ? [styles.activeButtonStyle, { borderBottomColor: this.primaryColor }]
                  : styles.buttonStyle,
              ]}>
              <Text style={[
                messageType === CometChat.MESSAGE_TYPE.IMAGE
                  ? styles.activeButtonTextStyle
                  : styles.buttonTextStyle,
              ]}>Photos</Text>
            </TouchableOpacity>
            {/* {messageType === CometChat.MESSAGE_TYPE.FILE ? (
              <View style={styles.separator} />
            ) : null} */}
            <TouchableOpacity
              onPress={() =>
                this.mediaClickHandler(CometChat.MESSAGE_TYPE.VIDEO)
              }
              style={
                messageType === CometChat.MESSAGE_TYPE.VIDEO
                  ? [styles.activeButtonStyle, { borderBottomColor: this.primaryColor }]
                  : styles.buttonStyle
              }>
              <Text style={[
                messageType === CometChat.MESSAGE_TYPE.VIDEO
                  ? styles.activeButtonTextStyle
                  : styles.buttonTextStyle,
              ]}>Videos</Text>
            </TouchableOpacity>
            {/* {messageType === CometChat.MESSAGE_TYPE.IMAGE ? (
              <View style={styles.separator} />
            ) : null} */}
            <TouchableOpacity
              onPress={() =>
                this.mediaClickHandler(CometChat.MESSAGE_TYPE.FILE)
              }
              style={[
                messageType === CometChat.MESSAGE_TYPE.FILE
                  ? [styles.activeButtonStyle, { borderBottomColor: this.primaryColor }]
                  : styles.buttonStyle,
              ]}>
              <Text style={[
                messageType === CometChat.MESSAGE_TYPE.FILE
                  ? styles.activeButtonTextStyle
                  : styles.buttonTextStyle,
              ]}>Docs</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            key={(messageType === CometChat.MESSAGE_TYPE.FILE) ? CometChat.MESSAGE_TYPE.FILE : CometChat.MESSAGE_TYPE.IMAGE}
            data={messages}
            extraData={messageType}
            renderItem={({ item }) => {
              return template(item);
            }}
            style={{
              maxHeight: deviceHeight * .70
            }}
            columnWrapperStyle={(messageType === CometChat.MESSAGE_TYPE.FILE) ? null : styles.mediaItemColumnStyle}
            contentContainerStyle={
              messages?.length ? null : styles.mediaItemStyle
            }
            showsVerticalScrollIndicator={false}
            numColumns={messageType === CometChat.MESSAGE_TYPE.FILE ? 1 : 3}
            ListEmptyComponent={this.emptyListComponent}
            onEndReached={this.getMessages}
          />
        </View>
        {
          this.state.AwesomeModal ?
            <CustomModal
              title={'Are you sure?'}
              message={`You really want to ${this.props.user.blockedByMe == true ? 'unblock' : 'block'} this User?`}
              no={'Cancel'}
              yes={this.props.user.blockedByMe == true ? 'Unblock' : 'Block'}
              closeModal={this.closeModal}
              AwesomeModal={this.state.AwesomeModal}
              onYesClick={this.props.user.blockedByMe == true ? this.unblock : this.block}
            />
            : null
        }
        {
          this.user_details?.role_id == 4 ?
            this.props.item.uid === SUPER_ADMIN_ID.staging || this.props.item.uid === this.cometchat_feedback_uid ?
              null
              :
              <View className='flex flex-row w-full h-[70px] mt-[10%] border-t-[1px] border-t-greyColor50 justify-start items-center px-5 bottom-0'>
                <Entypo name='block' size={16} color={Colors.errorColor} />
                {
                  this.props.user.blockedByMe == true ?
                    <TouchableOpacity className='ml-2' onPress={() => {
                      // this.props.actionGenerated(actions.UNBLOCK_USER);
                      this.setState({ AwesomeModal: true });
                    }}>
                      <Text className='text-errorColor text-[14px] leading-5 tracking-[0.44px] font-InterMedium font-medium'>Unblock {this.get_decrypted_name(this.props.item.name)}</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity className='ml-2' onPress={() => {
                      // this.props.actionGenerated(actions.BLOCK_USER);
                      // console.log('231117468172');
                      this.setState({ AwesomeModal: true });
                    }}>
                      <Text className='text-errorColor text-[14px] leading-5 tracking-[0.44px] font-InterMedium font-medium'>Block {this.get_decrypted_name(this.props.item.name)}</Text>
                    </TouchableOpacity>
                }

              </View>
            : null
        }
        <DropDownAlert ref={(ref) => (this.dropDownAlertRef = ref)} />
      </View>
    );
  }
}
