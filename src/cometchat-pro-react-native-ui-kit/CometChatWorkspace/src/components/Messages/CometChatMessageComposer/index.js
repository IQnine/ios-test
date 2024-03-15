/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-fragments */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Keyboard,
  Platform,
  Vibration,
  PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDIcon from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CometChat } from '@cometchat-pro/react-native-chat';
import Sound from 'react-native-sound';
import RNFetchBlob from 'rn-fetch-blob';
import style from './styles';

import {
  CometChatCreatePoll,
  CometChatSmartReplyPreview,
} from '../../Messages/Extensions';
import CometChatStickerKeyboard from '../CometChatStickerKeyboard';
import ComposerActions from './composerActions';

import { outgoingMessageAlert } from '../../../resources/audio';
import * as enums from '../../../utils/enums';
import * as actions from '../../../utils/actions';
import { heightRatio } from '../../../utils/consts';
import { logger } from '../../../utils/common';
import { CometChatContext } from '../../../utils/CometChatContext';
import { Colors } from '../../../../../../common/Colors';
import { Picker, Emoji } from 'emoji-mart-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { launchCamera } from 'react-native-image-picker';
import { Utils } from '../../../../../../common/Utils';
import FastImage from 'react-native-fast-image';
import { Icons } from '../../../../../../assets/Images';

export default class CometChatMessageComposer extends React.PureComponent {
  static contextType = CometChatContext;
  audioRecorderPlayer = new AudioRecorderPlayer();
  primaryColor = ''
  constructor(props) {
    super(props);
    this.imageUploaderRef = React.createRef();
    this.fileUploaderRef = React.createRef();
    this.audioUploaderRef = React.createRef();
    this.videoUploaderRef = React.createRef();
    this.messageInputRef = React.createRef();

    this.node = React.createRef();
    this.isTyping = false;

    this.state = {
      showFilePicker: false,
      messageInput: '',
      messageType: '',
      emojiViewer: false,
      createPoll: false,
      messageToBeEdited: '',
      replyPreview: null,
      stickerViewer: false,
      composerActionsVisible: false,
      user: null,
      keyboardActivity: false,
      restrictions: null,
      pickerVisible: false,
      recordSecs: 0,
      recordTime: '00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      modalVisible: false,
      height: 0,
      gif: false,
      isRecording: false,
      audioUri: null,
      isRecordingStopped: false
    };
    Sound.setCategory('Ambient', true);
    this.audio = new Sound(outgoingMessageAlert);
    CometChat.getLoggedinUser()
      .then((user) => (this.loggedInUser = user))
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.props?.showMessage('error', errorCode);
      });
  }

  componentDidMount() {
    this.getPrimaryColor()
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
    this.checkRestrictions();
  }

  checkRestrictions = async () => {
    let isLiveReactionsEnabled =
      await this.context.FeatureRestriction.isLiveReactionsEnabled();
    let isTypingIndicatorsEnabled =
      await this.context.FeatureRestriction.isTypingIndicatorsEnabled();
    let isSmartRepliesEnabled =
      await this.context.FeatureRestriction.isSmartRepliesEnabled();
    this.setState({
      restrictions: {
        isLiveReactionsEnabled,
        isTypingIndicatorsEnabled,
        isSmartRepliesEnabled,
      },
    });
  };

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({ keyboardActivity: true });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboardActivity: false });
  };

  componentDidUpdate(prevProps) {
    try {
      if (prevProps.messageToBeEdited !== this.props.messageToBeEdited) {
        const { messageToBeEdited } = this.props;
        this.setState({
          messageInput: messageToBeEdited.text,
          messageToBeEdited,
        });

        const element = this.messageInputRef.current;
        if (messageToBeEdited) {
          element.focus();
        } else {
          this.setState({
            messageInput: '',
          });
        }
      }

      if (prevProps.replyPreview !== this.props.replyPreview) {
        this.setState({ replyPreview: this.props.replyPreview });
      }

      if (prevProps.item !== this.props.item) {
        this.setState({ stickerViewer: false });
      }
    } catch (error) {
      logger(error);
    }
  }

  getPrimaryColor = async () => {
    this.primaryColor = await Utils.getData('primaryColor');
  }

  /**
   * Handler for audio when message is sent
   * @param
   */
  playAudio = () => {
    this.audio.setCurrentTime(0);
    this.audio.play(() => { });
  };

  /**
   * Handler for change in TextInput(messageComposer)
   * @param text: TextInput's value
   */

  changeHandler = (text) => {
    this.startTyping();
    this.setState({ messageInput: text, messageType: 'text' });
  };

  /**
   * Fetches the receiver's details.
   * @param
   */

  getReceiverDetails = () => {
    let receiverId;
    let receiverType;

    if (this.props.type === CometChat.RECEIVER_TYPE.USER) {
      receiverId = this.props.item.uid;
      receiverType = CometChat.RECEIVER_TYPE.USER;
    } else if (this.props.type === CometChat.RECEIVER_TYPE.GROUP) {
      receiverId = this.props.item.guid;
      receiverType = CometChat.RECEIVER_TYPE.GROUP;
    }

    return { receiverId, receiverType };
  };

  /**
   * handler for sending and generating media message
   * @param messageInput: object messageInput
   * @param messageType: object messageType
   */

  sendMediaMessage = (messageInput, messageType) => {
    try {
      const { receiverId, receiverType } = this.getReceiverDetails();
      const conversationId = this.props.getConversationId();
      const mediaMessage = new CometChat.MediaMessage(
        receiverId,
        messageInput,
        messageType,
        receiverType,
      );
      if (this.props.parentMessageId) {
        mediaMessage.setParentMessageId(this.props.parentMessageId);
      }

      this.endTyping();
      // mediaMessage.setSender(this.loggedInUser);
      mediaMessage.setReceiver(receiverType);
      mediaMessage.setConversationId(conversationId);
      mediaMessage.setType(messageType);
      mediaMessage._composedAt = Date.now();
      mediaMessage._id = '_' + Math.random().toString(36).substr(2, 9);
      mediaMessage.setId(mediaMessage._id)
      mediaMessage.setData({
        type: messageType,
        category: CometChat.CATEGORY_MESSAGE,
        name: messageInput['name'],
        file: messageInput,
        url: messageInput['uri'],
        sender: this.loggedInUser,
      });

      this.props.actionGenerated(actions.MESSAGE_COMPOSED, [mediaMessage]);
      CometChat.sendMessage(mediaMessage)
        .then(async (response) => {
          this.closeModal()
          this.playAudio();

          const newMessageObj = {
            ...response,
            _id: mediaMessage._id,
            localFile: messageInput,
          };
          this.props.actionGenerated(actions.MESSAGE_SENT, newMessageObj);
        })
        .catch((error) => {
          const newMessageObj = { ...mediaMessage, error: error };
          const errorCode = error?.message || 'ERROR';
          this.props.actionGenerated(
            actions.ERROR_IN_SEND_MESSAGE,
            newMessageObj,
          );

          this.props?.showMessage('error', errorCode);
          logger('Message sending failed with error: ', error);
        });
    } catch (error) {
      logger(error);
    }
  };

  /**
   * handler for sending Text Message
   * @param
   */

  sendTextMessage = () => {
    try {
      if (this.state.emojiViewer) {
        this.setState({ emojiViewer: false });
      }


      if (!this.state.messageInput.trim().length) {
        return false;
      }

      if (this.state.messageToBeEdited) {
        this.editMessage();
        return false;
      }
      this.endTyping();

      const { receiverId, receiverType } = this.getReceiverDetails();
      const messageInput = this.state.messageInput.trim();
      const conversationId = this.props.getConversationId();
      const textMessage = new CometChat.TextMessage(
        receiverId,
        messageInput,
        receiverType,
      );
      if (this.props.parentMessageId) {
        textMessage.setParentMessageId(this.props.parentMessageId);
      }

      textMessage.setSender(this.loggedInUser);
      textMessage.setReceiver(receiverType);
      textMessage.setText(messageInput);
      textMessage.setConversationId(conversationId);
      textMessage._composedAt = Date.now();
      textMessage._id = '_' + Math.random().toString(36).substr(2, 9);
      textMessage.setId(textMessage._id)
      this.props.actionGenerated(actions.MESSAGE_COMPOSED, [textMessage]);
      this.setState({ messageInput: '', replyPreview: false });
      this.messageInputRef.current.textContent = '';
      this.playAudio();
      CometChat.sendMessage(textMessage)
        .then((message) => {
          const newMessageObj = { ...message, _id: textMessage._id };
          this.messageInputRef.current.focus()
          this.setState({ messageInput: '', pickerVisible: false });
          this.messageInputRef.current.textContent = '';
          this.playAudio();
          this.props.actionGenerated(actions.MESSAGE_SENT, newMessageObj);
        })
        .catch((error) => {
          const newMessageObj = { ...textMessage, error: error };
          this.props.actionGenerated(
            actions.ERROR_IN_SEND_MESSAGE,
            newMessageObj,
          );
          logger('Message sending failed with error:', error);
          const errorCode = error?.message || 'ERROR';
          this.props?.showMessage('error', errorCode);
        });
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Handler for edit message
   * @param
   */

  editMessage = () => {
    try {
      const { messageToBeEdited } = this.props;

      const { receiverId, receiverType } = this.getReceiverDetails();

      const messageText = this.state.messageInput.trim();
      const textMessage = new CometChat.TextMessage(
        receiverId,
        messageText,
        receiverType,
      );
      textMessage.setId(messageToBeEdited.id);

      this.endTyping();

      CometChat.editMessage(textMessage)
        .then((message) => {
          this.setState({ messageInput: '' });
          this.messageInputRef.current.textContent = '';
          this.playAudio();

          this.closeEditPreview();
          this.props.actionGenerated(actions.MESSAGE_EDITED, message);
        })
        .catch((error) => {
          const errorCode = error?.message || 'ERROR';
          this.props?.showMessage('error', errorCode);
          logger('Message editing failed with error:', error);
        });
    } catch (error) {
      logger(error);
    }
  };

  /**
   * handler for action -> CLEAR_EDIT_PREVIEW
   * @param
   */
  closeEditPreview = () => {
    this.props.actionGenerated(actions.CLEAR_EDIT_PREVIEW);
  };

  /**
   * Handler For Generating typing Notification
   * @param timer: typingInterval
   * @param metadata: metadata object
   */

  startTyping = (timer, metadata) => {
    try {
      const typingInterval = timer || 5000;
      if (!this.state.restrictions?.isTypingIndicatorsEnabled) {
        return false;
      }
      if (this.isTyping) {
        return false;
      }

      const { receiverId, receiverType } = this.getReceiverDetails();
      const typingMetadata = metadata || undefined;

      const typingNotification = new CometChat.TypingIndicator(
        receiverId,
        receiverType,
        typingMetadata,
      );
      CometChat.startTyping(typingNotification);

      this.isTyping = setTimeout(() => {
        this.endTyping();
      }, typingInterval);
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Handler to end typing Notification
   * @param metadata: metadata object
   */

  endTyping = (metadata) => {
    try {
      const { receiverId, receiverType } = this.getReceiverDetails();

      const typingMetadata = metadata || undefined;

      const typingNotification = new CometChat.TypingIndicator(
        receiverId,
        receiverType,
        typingMetadata,
      );
      CometChat.endTyping(typingNotification);

      clearTimeout(this.isTyping);
      this.isTyping = null;
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Handler to toggle Sticker Picker screen
   * @param
   */

  toggleStickerPicker = () => {
    const { stickerViewer } = this.state;
    this.setState({
      composerActionsVisible: false,
      stickerViewer: !stickerViewer,
    });
    this.messageInputRef.current.blur()
  };

  toggleEmojiPicker = () => {
    const { pickerVisible } = this.state;
    this.setState({
      pickerVisible: !pickerVisible,
    });
    this.messageInputRef.current.blur()
  };

  /**
   * handler to toggle create poll screen
   * @param
   */
  toggleCreatePoll = () => {
    const { createPoll } = this.state;
    this.setState({ composerActionsVisible: false, createPoll: !createPoll });
  };

  /**
   * handler to close create poll screen
   * @param
   */
  closeCreatePoll = () => {
    this.toggleCreatePoll();
  };

  /**
   * handler for various action
   * @param action: action name
   * @param message: message object
   */
  actionHandler = (action, message) => {
    switch (action) {
      case actions.POLL_CREATED:
        this.toggleCreatePoll();
        if (this.props.type === enums.TYPE_USER) {
          this.props.actionGenerated(actions.POLL_CREATED, [message]);
        }
        // temporary check; custom data listener working for sender too\

        break;
      case actions.SEND_STICKER:
        this.sendSticker(message);
        break;
      case actions.CLOSE_STICKER:
        this.toggleStickerPicker();
        break;
      default:
        break;
    }
  };

  /**
   * handler for sending sticker message
   * @param stickerMessage: object stickerMessage
   */
  sendSticker = (stickerMessage) => {
    this.setState({
      composerActionsVisible: false,
      stickerViewer: false,
    })
    this.messageInputRef.current.focus()
    const { receiverId, receiverType } = this.getReceiverDetails();

    const customData = {
      sticker_url: stickerMessage.stickerUrl,
      sticker_name: stickerMessage.stickerName,
    };
    const customType = enums.CUSTOM_TYPE_STICKER;
    const conversationId = this.props.getConversationId();
    const customMessage = new CometChat.CustomMessage(
      receiverId,
      receiverType,
      customType,
      customData,
    );
    if (this.props.parentMessageId) {
      customMessage.setParentMessageId(this.props.parentMessageId);
    }
    customMessage.setConversationId(conversationId);
    customMessage.setSender(this.loggedInUser);
    customMessage.setReceiver(receiverType);
    customMessage.setConversationId(conversationId);
    customMessage._composedAt = Date.now();
    customMessage._id = '_' + Math.random().toString(36).substr(2, 9);
    this.props.actionGenerated(actions.MESSAGE_COMPOSED, [customMessage]);
    CometChat.sendCustomMessage(customMessage)
      .then((message) => {
        this.playAudio();
        const newMessageObj = { ...message, _id: customMessage._id };
        this.props.actionGenerated(actions.MESSAGE_SENT, newMessageObj);
      })
      .catch((error) => {
        const newMessageObj = { ...customMessage, error: error };
        this.props.actionGenerated(
          actions.ERROR_IN_SEND_MESSAGE,
          newMessageObj,
        );
        const errorCode = error?.message || 'ERROR';

        this.props?.showMessage('error', errorCode);
        logger('custom message sending failed with error', error);
      });
  };

  /**
   * handler for sending reply message
   * @param messageInput: object messageInput
   */

  sendReplyMessage = (messageInput) => {
    try {
      const { receiverId, receiverType } = this.getReceiverDetails();
      const textMessage = new CometChat.TextMessage(
        receiverId,
        messageInput,
        receiverType,
      );
      if (this.props.parentMessageId) {
        textMessage.setParentMessageId(this.props.parentMessageId);
      }

      CometChat.sendMessage(textMessage)
        .then((message) => {
          this.playAudio();
          this.setState({ replyPreview: null });
          this.props.actionGenerated(actions.MESSAGE_COMPOSED, [message]);
        })
        .catch((error) => {
          const errorCode = error?.message || 'ERROR';
          this.props?.showMessage('error', errorCode);
          logger('Message sending failed with error:', error);
        });
    } catch (error) {
      logger(error);
    }
  };

  clearReplyPreview = () => {
    this.setState({ replyPreview: null });
  };

  /**
   * handler for sending reactions
   * @param
   */
  sendReaction = (event) => {
    const typingInterval = 1000;
    try {
      const metadata = {
        type: enums.METADATA_TYPE_LIVEREACTION,
        reaction: this.props.reactionName || 'heart',
      };

      const { receiverId, receiverType } = this.getReceiverDetails();
      let transientMessage = new CometChat.TransientMessage(
        receiverId,
        receiverType,
        metadata,
      );
      CometChat.sendTransientMessage(transientMessage);
    } catch (err) {
      logger(err);
    }
    this.props.actionGenerated(actions.SEND_REACTION);
    event.persist();
    setTimeout(() => {
      this.props.actionGenerated(actions.STOP_REACTION);
    }, typingInterval);
  };

  addEmoji = (emoji) => {
    try {
      this.setState({ messageInput: this.state.messageInput.concat(emoji.native) })
    } catch (e) {
      console.log(e)
    }
  }

  onStartRecord = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        )
        if (grants === PermissionsAndroid.RESULTS.GRANTED) {
          const dirs = RNFetchBlob.fs.dirs;
          const path = Platform.select({
            ios: 'hello.m4a',
            android: `${dirs.CacheDir}/hello.mp3`,
          });
          const result = await this.audioRecorderPlayer.startRecorder(path);
          this.setState({
            isRecording: true,
            isRecordingStopped: false
          })
          this.audioRecorderPlayer.addRecordBackListener((e) => {
            this.setState({
              recordSecs: e.currentPosition,
              recordTime: this.audioRecorderPlayer.mmss(
                Math.floor(e.currentPosition / 1000),
              ),
            });
            return;
          });
        }

      } catch (err) {
        console.warn(err);

        return;
      }
    }
  };

  onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.setState({ isRecording: false })
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
      isRecordingStopped: true
    });
    if (result) {
      this.setState({ audioUri: result })
    } else {

    }
  };

  sendAudio = async () => {
    try {
      let uri = this.state.audioUri
      let blob = await fetch(uri).then(r => r.blob());
      let d = {
        ...blob._data,
        uri: uri,
      }
      this.sendMediaMessage(d, CometChat.MESSAGE_TYPE.AUDIO)
    } catch (e) {
      console.log('send audio error:', e)
    }
  }

  closeModal = () => {
    this.setState({
      recordSecs: 0,
      recordTime: '00:00',
      audioUri: null,
      isRecording: false,
      isRecordingStopped: false,
      modalVisible: false
    })
  }

  gif = async () => {
    let t = setTimeout(() => {
      this.setState({ gif: !this.state.gif })
      if (this.state.modalVisible === true && this.state.isRecordingStopped == false) {
        this.gif()
      }
    }, 70)
  }
  takePhoto = async (mediaType = 'photo') => {
    try {
      let granted = null;
      if (Platform.OS === 'android') {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'TruLeague Camera Permission',
            message: 'TruLeague needs access to your camera ',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
      }

      if (
        Platform.OS === 'ios' ||
        granted === PermissionsAndroid.RESULTS.GRANTED
      ) {
        launchCamera(
          {
            mediaType,
            includeBase64: false,
            cameraType: 'back',
            presentationStyle:'fullScreen'
          },
          (response) => {
            this.sheetRef?.current?.snapTo(1);
            if (response.didCancel) {
              return null;
            }
            let type = null;
            let name = null;
            if (Platform.OS === 'ios' && response.assets[0].fileName !== undefined) {
              name = response.assets[0].fileName;
              type = response.assets[0].type;
            } else {
              type = response.assets[0].type;
              name = 'Camera_001.jpeg';
            }
            if (mediaType == 'video') {
              type = 'video/quicktime';
              name = 'Camera_002.mov';
            }
            const file = {
              name:
                Platform.OS === 'android' && mediaType != 'video'
                  ? response.assets[0].fileName
                  : name,
              type:
                Platform.OS === 'android' && mediaType != 'video'
                  ? response.assets[0].type
                  : type,
              uri:
                Platform.OS === 'android'
                  ? response.assets[0].uri
                  : response.assets[0].uri.replace('file://', ''),
            };
            this.sendMediaMessage(
              file,
              mediaType === 'photo'
                ? CometChat.MESSAGE_TYPE.IMAGE
                : CometChat.MESSAGE_TYPE.VIDEO,
            );
          },
        );
      }
    } catch (err) {
      // this.sheetRef?.current?.snapTo(1);
      // this.props.close();
      console.log('err',err)
    }
  };
  render() {
    let disabled = false;
    if (this.props.item.blockedByMe) {
      disabled = true;
    }
    let liveReactionBtn = null;

    if (
      Object.prototype.hasOwnProperty.call(
        enums.LIVE_REACTIONS,
        this.props.reaction,
      )
    ) {
      const reactionName = this.props.reaction;
      liveReactionBtn = (
        <TouchableOpacity
          style={style.reactionBtnStyle}
          disabled={disabled}
          onPress={this.sendReaction}>
          <Icon name={`${reactionName}`} size={30} color="#de3a39" />
        </TouchableOpacity>
      );
    }

    let sendBtn = (
      <TouchableOpacity
        style={style.sendButtonStyle}
        onPress={() => this.sendTextMessage()}>
        <Icon name="send" size={20} color={this.props.primaryColor} />
        {/* color="#3299ff" */}
      </TouchableOpacity>
    );

    if (
      !this.state.messageInput.length &&
      this.state.restrictions?.isLiveReactionsEnabled
    ) {
      sendBtn = null;
    } else {
      liveReactionBtn = null;
    }

    let editPreview = null;
    if (this.state.messageToBeEdited) {
      editPreview = (
        <View
          style={[
            style.editPreviewContainerStyle,
            {
              backgroundColor: `${this.props.theme.backgroundColor.white}`,
              borderColor: `${this.props.theme.borderColor.primary}`,
            },
          ]}>
          <View
            style={[
              style.previewHeadingContainer,
              {
                borderLeftColor: this.props.theme.color.secondary,
              },
            ]}>
            <View style={style.previewHeadingStyle}>
              <Text
                style={[
                  style.previewTextStyle,
                  {
                    // color: `${this.props.theme.color.black}`,
                    color: Colors.black
                  },
                ]}>
                Edit message
              </Text>
              <TouchableOpacity
                style={style.previewCloseStyle}
                onPress={this.closeEditPreview}>
                <Icon
                  name="close"
                  size={23}
                  color={this.props.theme.color.secondary}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text
                style={{
                  color: `${this.props.theme.color.helpText}`,
                }}>
                {this.state.messageToBeEdited.text}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    let blockedPreview = null;
    if (disabled) {
      blockedPreview = (
        <View
          style={[
            style.blockedPreviewContainer,
            {
              backgroundColor: this.props.theme.backgroundColor.blue,
            },
          ]}>
          <Text
            style={[
              style.blockedPreviewText1,
              {
                // color: this.props.theme.color.white,
                color: Colors.white
              },
            ]}>
            You have blocked this user
          </Text>
          <Text
            style={[
              style.blockedPreviewText2,
              {
                // color: this.props.theme.color.white,
                color: Colors.white
              },
            ]}>
            To start conversations, click on the user info and unblock the user
          </Text>
        </View>
      );
    }

    let smartReplyPreview = null;
    if (this.state.replyPreview) {
      const message = this.state.replyPreview;
      if (Object.prototype.hasOwnProperty.call(message, 'metadata')) {
        const { metadata } = message;
        if (Object.prototype.hasOwnProperty.call(metadata, '@injected')) {
          const injectedObject = metadata['@injected'];
          if (
            Object.prototype.hasOwnProperty.call(injectedObject, 'extensions')
          ) {
            const extensionsObject = injectedObject.extensions;
            if (
              Object.prototype.hasOwnProperty.call(
                extensionsObject,
                'smart-reply',
              )
            ) {
              const smartReplyObject = extensionsObject['smart-reply'];

              const options = [
                smartReplyObject.reply_positive,
                smartReplyObject.reply_neutral,
                smartReplyObject.reply_negative,
              ];

              smartReplyPreview = (
                <CometChatSmartReplyPreview
                  {...this.props}
                  options={options}
                  clicked={this.sendReplyMessage}
                  close={this.clearReplyPreview}
                />
              );
            }
          }
        }
      }
    }

    if (!this.state.restrictions?.isSmartRepliesEnabled) {
      smartReplyPreview: false;
    }

    let stickerViewer = null;
    if (this.state.stickerViewer) {
      stickerViewer = (
        <CometChatStickerKeyboard
          theme={this.props.theme}
          item={this.props.item}
          type={this.props.type}
          actionGenerated={this.actionHandler}
        />
      );
    }

    const createPoll = (
      <CometChatCreatePoll
        theme={this.props.theme}
        item={this.props.item}
        type={this.props.type}
        open={this.state.createPoll}
        close={this.closeCreatePoll}
        actionGenerated={this.actionHandler}
      />
    );
    const { pickerVisible } = this.state;
    return (
      <View
        style={
          Platform.OS === 'android' && this.state.keyboardActivity
            ? {
              marginBottom: 21 * heightRatio,
              elevation: 5,
              backgroundColor: '#fff',
            }
            : { elevation: 5, backgroundColor: '#fff' }
        }>
        {/* <Modal
          isVisible={this.state.modalVisible}
          // isVisible={true}
          onBackButtonPress={() => this.setState({ modalVisible: false })}
          onBackdropPress={() => this.setState({ modalVisible: false })}
          animationInTiming={1}
          animationOutTiming={1}>
          <View className='w-[100%] h-[25%] bg-bgGrayColor flex items-center p-3'>
            <TouchableOpacity
              className={`p-3 rounded-full ${this.state.isRecording ? 'bg-onlineColor' : 'bg-bgGrayColor'}`}
              disabled={disabled}
              onPress={() => { this.state.isRecording ? this.onStopRecord() : this.onStartRecord() }}
            >
              <MaterialIcons size={40} name="keyboard-voice" color="rgba(0,0,0,0.35)" />
            </TouchableOpacity>

            <Text className='mt-3 text-greyBorder text-l font-bold'>{this.state.recordTime}</Text>

            {this.state.isRecordingStopped ?
              <View className='flex flex-row w-full h-full justify-center'>
                <View className='mx-2'>
                  <TouchableOpacity
                    onPress={() => { this.closeModal() }}
                    className='p-3 rounded-full bg-errorColor justify-center items-center mt-4 flex flex-row'>
                    <Icon name="close" size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>
                <View className='mx-2'>
                  <TouchableOpacity
                    onPress={() => { this.sendAudio() }}
                    className='p-3 rounded-full bg-onlineColor justify-center items-center mt-4 flex flex-row'>
                    <Icon name="send" size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View> :
              null
            }
          </View>
        </Modal> */}
        {blockedPreview}
        {editPreview}
        {/* {createPoll} */}
        {stickerViewer}
        {smartReplyPreview}
        <ComposerActions
          visible={this.state.composerActionsVisible}
          close={() => {
            if (this.state.composerActionsVisible == true) {
              this.setState({ composerActionsVisible: false });
            }
          }}
          toggleStickers={this.toggleStickerPicker}
          // toggleCreatePoll={this.toggleCreatePoll}
          sendMediaMessage={this.sendMediaMessage}
        />
        <View style={style.mainContainer}>
          <View style={style.textInputContainer}>
            {
              this.state.modalVisible ?
                <>
                  <View className='h-[50px] border-[1.5px] w-[85%] rounded-[30px] flex-row justify-between mt-[.5px] items-center' >
                    <View className='justify-center items-center ml-[8px]'>
                      <Text className='text-greyBorder text-l font-bold'>{this.state.recordTime}</Text>
                    </View>
                    <View className='justify-center'>
                      {
                        this.state.gif ?
                          <Text className='text-[14px] text-black'>..|..|..|..|..|..|..|..|..|..|..|..|..|..|..|..</Text>
                          : <Text className='text-[14px] text-black'>|..|..|..|..|..|..|..|..|..|..|..|..|..|..|..|</Text>
                      }
                    </View>
                    <TouchableOpacity onPress={() => { this.setState({ modalVisible: false }); this.onStopRecord() }} style={{ backgroundColor: Colors.greyColor50 }} className='mr-[10px] rounded-[30px] h-[30px] w-[30px]  items-center justify-center'>
                      <FastImage source={Icons.IcCross} className='w-[15px] h-[15px]' tintColor={Colors.black} />
                    </TouchableOpacity>
                  </View>
                  {
                    this.state.isRecording ?
                      (<TouchableOpacity
                        className=' rounded-[30px] ml-[8px] h-[42px] w-[42px] mr-[4px] items-center justify-center'
                        style={{ backgroundColor: this.primaryColor }}
                        disabled={disabled}
                        onPress={() => { this.onStopRecord() }}
                      >
                        <View className='bg-white h-[10px] w-[10px]' ></View>
                      </TouchableOpacity>)
                      :
                      <TouchableOpacity
                        className='mr-[8px]'
                        onPress={() => { this.setState({ modalVisible: false }); this.sendAudio() }}
                        style={style.sendButtonStyle}
                      >
                        <Icon name="send" size={25} color={this.props.primaryColor} />
                      </TouchableOpacity>

                  }
                </>
                :
                <>
                  <View className='justify-center items-center border-[1.5px] mr-2 rounded-[24px] h-auto flex-row max-w-[65%] w-full ' style={{ borderColor: this.primaryColor, maxWidth: this.state.messageInput.length == 0 ? '65%' : '80%' }}>
                    <TouchableOpacity
                      className='m-[2px] ml-[8px]'
                      disabled={disabled}
                      onPress={() => {
                        this.toggleEmojiPicker()
                      }}>
                      <Entypo size={26} name="emoji-happy" color={Colors.textColor} />
                    </TouchableOpacity>
                    <TextInput
                      onSubmitEditing={() => { this.sendTextMessage() }}
                      style={[style.messageInputStyle, { color: this.props.primaryColor, height: Math.min(118, Math.max(42, this.state.height)), alignItems: 'flex-start', textAlign: 'left', textAlignVertical: 'top' }]}
                      multiline={true}
                      onContentSizeChange={(event) => {
                        this.setState({ height: event.nativeEvent.contentSize.height })
                      }}
                      editable={!disabled}
                      value={this.state.messageInput}
                      placeholder="Can you tell me..."
                      onChangeText={(text) => this.changeHandler(text)}
                      onBlur={this.endTyping}
                      onFocus={() => { this.setState({ composerActionsVisible: false, stickerViewer: false, }) }}
                      onResponderStart={() => this.setState({ pickerVisible: false })}
                      ref={this.messageInputRef}
                      placeholderTextColor={Colors.textColor}
                    />
                  </View>
                  {
                    this.state.messageInput.length == 0 ?
                      <View className='items-center justify-between bg-[#EDEEF5] flex-row rounded-[30px] w-[121px] h-[42px]'  >
                        <TouchableOpacity
                          disabled={disabled}
                          onPress={() => {
                            this.setState({ composerActionsVisible: true });
                          }}>
                          <FastImage source={Icons.IcPin} className='w-[35px] h-[35px]' tintColor={Colors.textColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={style.plusCircleContainer}
                          disabled={disabled}
                          onPress={() => {
                            this.takePhoto()
                          }}>
                          <FastImage source={Icons.IcCamera} className='w-[35px] h-[35px]' tintColor={Colors.textColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className='rounded-[30px] h-[42px] w-[42px] items-center justify-center'
                          style={{ backgroundColor: this.primaryColor }}
                          disabled={disabled}
                          onPress={() => {
                            this.setState({ modalVisible: true });
                            this.onStartRecord();
                            this.gif()
                          }}
                        >
                          <MaterialIcons size={26} name="keyboard-voice" color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                      :
                      <>
                        <TouchableOpacity
                          disabled={disabled}
                          onPress={() => {
                            this.setState({ composerActionsVisible: true });
                          }}>
                          <FastImage source={Icons.IcPin} className='w-[35px] h-[35px]' tintColor={Colors.textColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          className=''
                          style={style.sendButtonStyle}
                          onPress={() => this.sendTextMessage()}>
                          <Icon name="send" size={25} color={this.props.primaryColor} />
                        </TouchableOpacity>
                      </>
                  }
                </>
            }
          </View>
          {/* {liveReactionBtn} */}
        </View>
        {
          pickerVisible ?
            <Picker
              isVisible={pickerVisible}
              native={true}
              autoFocus={false}
              emojiSize={35}
              emojiMargin={18}
              style={{ borderTopRadius: 10, overflow: 'hidden' }}
              skinEmoji=":+1:"
              showCloseButton
              onSelect={(emoji) => { this.addEmoji(emoji) }}
              onClick={(i, e) => { }}
              onPressClose={() => {
                this.setState({ pickerVisible: false });
              }}
            // onSelect={this.reactToMessages}
            />
            :
            <></>
        }
      </View>
    );
  }
}
