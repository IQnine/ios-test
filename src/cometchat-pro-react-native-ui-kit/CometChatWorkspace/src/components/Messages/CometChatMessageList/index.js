/* eslint-disable react/no-unused-state */
/* eslint-disable no-shadow */
import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Pressable } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';

import { CometChatManager } from '../../../utils/controller';
import { MessageListManager } from './controller';

import * as enums from '../../../utils/enums';
import * as actions from '../../../utils/actions';
import CometChatSenderPollMessageBubble from '../../Messages/Extensions/CometChatSenderPollMessageBubble';
import CometChatSenderStickerMessageBubble from '../../Messages/Extensions/CometChatSenderStickerMessageBubble';
import CometChatReceiverPollMessageBubble from '../../Messages/Extensions/CometChatReceiverPollMessageBubble';
import CometChatReceiverStickerMessageBubble from '../../Messages/Extensions/CometChatReceiverStickerMessageBubble';
import CometChatActionMessageBubble from '../CometChatActionMessageBubble';
import CometChatDeleteMessageBubble from '../CometChatDeleteMessageBubble';
import CometChatReceiverVideoMessageBubble from '../CometChatReceiverVideoMessageBubble';
import CometChatSenderVideoMessageBubble from '../CometChatSenderVideoMessageBubble';
import CometChatSenderFileMessageBubble from '../CometChatSenderFileMessageBubble';
import CometChatReceiverFileMessageBubble from '../CometChatReceiverFileMessageBubble';
import CometChatSenderAudioMessageBubble from '../CometChatSenderAudioMessageBubble';
import CometChatReceiverAudioMessageBubble from '../CometChatReceiverAudioMessageBubble';
import CometChatReceiverImageMessageBubble from '../CometChatReceiverImageMessageBubble';
import CometChatSenderTextMessageBubble from '../CometChatSenderTextMessageBubble';
import CometChatSenderImageMessageBubble from '../CometChatSenderImageMessageBubble';
import CometChatReceiverTextMessageBubble from '../CometChatReceiverTextMessageBubble';
import CometChatReceiverDirectCallBubble from '../CometChatReceiverDirectCallBubble';
import CometChatSenderDirectCallBubble from '../CometChatSenderDirectCallBubble';
import {
  CometChatIncomingCall,
  CometChatOutgoingCall,
  CometChatOutgoingDirectCall,
  CometChatIncomingDirectCall,
} from '../../Calls';
import styles from './styles';
import { logger } from '../../../utils/common';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { CometChatContext } from '../../../utils/CometChatContext';
import * as AmbassadorService from '../../../../../../services/prospect/ambassadors/AmbassadorsServices';
import { Utils } from '../../../../../../common/Utils';
import { MultiSelect, Dropdown } from 'react-native-element-dropdown';
import FastImage from 'react-native-fast-image';
import { Icons, Images } from '../../../../../../assets/Images';
import * as AmbassadorServices from '../../../../../../services/prospect/ambassadors/AmbassadorsServices';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Colors } from '../../../../../../common/Colors';
import * as CometChatServices from '../../../../../../services/ambassador/conversation/CometchatServices';
import * as InstituteServices from '../../../../../../services/prospect/institutes/InstituteServices';
import * as _Auth_services from '../../../../../../services/auth/AuthServices';
import { COMETCHAT_CONSTANTS, SUPER_ADMIN_ID } from '../../../../../../CONSTS';
import moment from 'moment';
import * as AuthServices from '../../../../../../services/auth/AuthServices';

let cDate = null;

class CometChatMessageList extends React.PureComponent {
  loggedInUser = null;

  lastScrollTop = 0;
  cometchat_feedback_uid = '';
  times = 0;
  primaryColor = ''
  user_details = ''
  collegeData = {}
  decoratorMessage = 'Loading...';
  static contextType = CometChatContext;

  constructor(props) {
    super(props);
    this.state = {
      onItemClick: null,
      suggestionsData: null,
      messageInput: '',
      areaOfQueryData: [],
      selected: [],
      value: 0,
      isFocus: false,
      isFocus1: false,
      messageId: null,
      messageKey: ''
    };
    this.loggedInUser = props.loggedInUser;
    this.flatListRef = React.createRef();
    this.messageInputRef = React.createRef();
    // this.getPrimaryColor();
  }

  componentDidMount() {
    this.setState({ messageId: this.props.item.messageId, messageKey: this.props.message_key })
    if (this.props.parentMessageId) {
      this.MessageListManager = new MessageListManager(
        this.props.item,
        this.props.type,
        this.props.parentMessageId,
        this.context,
      );
    } else {
      this.MessageListManager = new MessageListManager(
        this.props.item,
        this.props.type,
        null,
        this.context,
      );
    }
    this.getChatSuggestionsMessages()
    this.getMessages();
    this.getPrimaryColor();
    this.MessageListManager.attachListeners(this.messageUpdated);
    // this.getConversation();
  }

  componentDidUpdate(prevProps) {
    try {
      const previousMessageStr = JSON.stringify(prevProps.messages);
      const currentMessageStr = JSON.stringify(this.props.messages);
      if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        prevProps.item.uid !== this.props.item.uid
      ) {
        this.decoratorMessage = 'Loading...';
        this.MessageListManager?.removeListeners();

        if (this.props.parentMessageId) {
          this.MessageListManager = new MessageListManager(
            this.props.item,
            this.props.type,
            this.props.parentMessageId,
            this.context,
          );
        } else {
          this.MessageListManager = new MessageListManager(
            this.props.item,
            this.props.type,
            null,
            this.context,
          );
        }

        this.getMessages();
        this.MessageListManager.attachListeners(this.messageUpdated);
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        prevProps.item.guid !== this.props.item.guid
      ) {
        this.decoratorMessage = 'Loading...';
        this.MessageListManager?.removeListeners();

        if (this.props.parentMessageId) {
          this.MessageListManager = new MessageListManager(
            this.props.item,
            this.props.type,
            this.props.parentMessageId,
          );
        } else {
          this.MessageListManager = new MessageListManager(
            this.props.item,
            this.props.type,
          );
        }

        this.getMessages();
        this.MessageListManager.attachListeners(this.messageUpdated);
      } else if (prevProps.parentMessageId !== this.props.parentMessageId) {
        this.decoratorMessage = 'Loading...';
        this.MessageListManager?.removeListeners();
        this.MessageListManager = new MessageListManager(
          this.props.item,
          this.props.type,
          this.props.parentMessageId,
        );
        this.getMessages();
        this.MessageListManager.attachListeners(this.messageUpdated);
      }
    } catch (error) {
      logger(error);
    }
  }

  componentWillUnmount() {
    this.MessageListManager?.removeListeners();
    this.MessageListManager = null;
  }

  getConversation = async () => {
    let uid = await Utils.getData('ambassador_cometchat_uid')
    let conversationId = this.props.item.conversationId
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          apikey: COMETCHAT_CONSTANTS.API_KEY,
          onBehalfOf: uid
        }
      };
      CometChat.getLoggedinUser().then(
        (user) => {
          fetch(`https://241639cc23984652.api-us.cometchat.io/v3/messages?receiverType=user&myMentionsOnly=false&mentionsWithBlockedInfo=false&mentionswithTagInfo=false&hideDeleted=true&limit=100&conversationId=${conversationId}`, options)
            .then(response => response.json())
            .then(response => {
              if (response.data.length < 0) {
              } else {
                let t = setTimeout(() => {
                  const result = Object.values(
                    response?.data?.reduce((msg, obj) => ({ ...msg, [obj?.rawMessage?.id]: obj }), {})
                  );
                  let messages = [...result];
                  if (messages.length) {
                    messages = messages.reverse();
                  }
                  let messageIndex = null
                  if (this.props.item.messageId !== null) {
                    messageIndex = messages.findIndex(t => t.id === this.props.item.messageId)
                    if (messageIndex !== -1) {
                      this.flatListRef.current.scrollToIndex({ index: messageIndex, animated: true })
                    }
                  } else {
                    clearTimeout(t)
                  }
                }, 1500)
              }
            })
            .catch(
              err => console.error("Error while fetching conversation list:", err)
            );
        }
      );
    } catch (error) {
      console.log("Error:", error);
    }
  }

  getPrimaryColor = async () => {
    this.primaryColor = await Utils.getData('primaryColor')
    this.user_details = await Utils.getData('user_details');
    this.collegeData = await Utils.getData('collegeData');
    this.cometchat_feedback_uid = await Utils.getData('cometchat_feedback_uid');
  }
  decrypt(name) {
    return _Auth_services.decrypt(name);
  }

  get_decrypted_name = (name) => {
    let user_name = AuthServices.decrypt(name)
    return user_name
  }

  /**
   * handler for fetching messages for logged in user and previous conversations.
   * @param scrollToBottom: Event(boolean)
   */
  getMessages = (scrollToBottom = false) => {
    //getMessages() here...
    const actionMessages = [];
    new CometChatManager()
      .getLoggedInUser()
      .then((user) => {
        this.MessageListManager.fetchPreviousMessages()
          .then((messageList) => {
            if (messageList.length === 0) {
              this.decoratorMessage = `Start chat with ${this.get_decrypted_name(this.props.item.name)}...`;
            }
            let t = setTimeout(() => {
              const result = Object.values(
                messageList.reduce((msg, obj) => ({ ...msg, [obj?.rawMessage?.id]: obj }), {})
              );
              let messages = [...result];
              if (messages.length) {
                messages = messages.reverse();
              }
              let messageIndex = null
              if (this.props.item.messageId !== null) {
                messageIndex = messages.findIndex(t => { return t.id === this.props.item.messageId })
                if (messageIndex !== -1) {
                  this.flatListRef.current.scrollToIndex({ index: messageIndex })
                }
              } else {
                clearTimeout(t)
              }
            }, 1500)

            messageList.forEach((message) => {
              if (
                message.category === 'action' &&
                message.sender.uid === 'app_system'
              ) {
                actionMessages.push(message);
              }
              this.markMessageAsDelivered(message);

              // if the sender of the message is not the logged in user, mark it as read.
              if (
                message.getSender().getUid() !== user.getUid() &&
                !message.getReadAt()
              ) {
                CometChat.markAsRead(message);
              }
              this.props.actionGenerated(actions.MESSAGE_READ, message);
            });

            let actionGenerated = actions.MESSAGE_FETCHED;
            if (scrollToBottom === true) {
              actionGenerated = actions.MESSAGE_FETCHED_AGAIN;
            }

            ++this.times;

            if (
              (this.times === 1 && actionMessages.length > 5) ||
              (this.times > 1 && actionMessages.length === 30)
            ) {
              this.props.actionGenerated(actions.MESSAGE_FETCHED, messageList);
              this.getMessages(true);
            } else {
              this.props.actionGenerated(actionGenerated, messageList);
            }
          })
          .catch((error) => {
            this.decoratorMessage = '';
            logger(
              '[CometChatMessageList] getMessages fetchPrevious error',
              error,
            );
          });
      })
      .catch((error) => {
        this.decoratorMessage = 'Error';
        logger(
          '[CometChatMessageList] getMessages getLoggedInUser error',
          error,
        );
      });
  };

  getChatSuggestionsMessages = async () => {
    await AmbassadorService.get_chat_suggestions().then((res) => {
      if (res.statusCode == 200) {
        this.setState({ suggestionsData: res.data })
      }
    })
  }

  markMessageAsDelivered = (message) => {
    try {
      if (
        message.sender?.uid !== this.loggedInUser?.uid &&
        message.hasOwnProperty('deliveredAt') === false
      ) {
        CometChat.markAsDelivered(message);
      }
    } catch (error) {
      logger(
        '[CometChatMessageList markMessageAsDelivered] faailed to mark as deivered =',
        message,
      );
    }
  };

  // callback for listener functions
  messageUpdated = (key, message, group, options, actionBy) => {
    switch (key) {
      case enums.MESSAGE_DELETED:
        this.messageDeleted(message);
        break;
      case enums.MESSAGE_EDITED:
        this.messageEdited(message);
        break;
      case enums.MESSAGE_DELIVERED:
      case enums.MESSAGE_READ:
        this.messageReadAndDelivered(message);
        break;
      case enums.TEXT_MESSAGE_RECEIVED:
      case enums.MEDIA_MESSAGE_RECEIVED:
        this.newMsgComponent();
        this.messageReceived(message);
        break;
      case enums.CUSTOM_MESSAGE_RECEIVED:
        this.customMessageReceived(message);
        break;
      case enums.GROUP_MEMBER_SCOPE_CHANGED:
      case enums.GROUP_MEMBER_JOINED:
      case enums.GROUP_MEMBER_LEFT:
        this.groupUpdated(key, message, group, options);
        this.messageReceived(message);
        break;
      case enums.GROUP_MEMBER_ADDED:
      case enums.GROUP_MEMBER_KICKED:
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_UNBANNED:
        if (this.loggedInUser.uid !== actionBy.uid)
          this.groupUpdated(key, message, group, options);
        this.messageReceived(message);
        break;
      case enums.INCOMING_CALL_RECEIVED:
      case enums.INCOMING_CALL_CANCELLED:
      case enums.OUTGOING_CALL_ACCEPTED:
      case enums.OUTGOING_CALL_REJECTED:
        this.callUpdated(message);
        break;

      case enums.TRANSIENT_MESSAGE_RECEIVED:
        this.props.actionGenerated(enums.TRANSIENT_MESSAGE_RECEIVED, message);
        break;
      default:
        break;
    }
  };

  /**
   * handler for message deleted by logged in user and updations for groups/user.
   * @param message: message object
   */

  messageDeleted = (message) => {
    if (
      this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiver().guid === this.props.item.guid
    ) {
      this.props.actionGenerated(actions.MESSAGE_DELETED, [message]);
    } else if (
      this.props.type === CometChat.RECEIVER_TYPE.USER &&
      message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
      message.getSender().uid === this.props.item.uid
    ) {
      this.props.actionGenerated(actions.MESSAGE_DELETED, [message]);
    }
  };

  /**
   * handler for when the message is edited by the logged in user.
   * @param message: message object
   */
  messageEdited = (message) => {
    try {
      const messageList = [...this.props.messages];
      const updateEditedMessage = (message) => {
        const messageKey = messageList.findIndex((m) => m.id === message.id);
        if (messageKey > -1) {
          const messageObj = messageList[messageKey];
          const newMessageObj = { ...messageObj, ...message };

          messageList.splice(messageKey, 1, newMessageObj);
          this.props.actionGenerated(actions.MESSAGE_UPDATED, messageList);
        }
      };

      if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiver().guid === this.props.item.guid
      ) {
        updateEditedMessage(message);
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        this.loggedInUser.uid === message.getReceiverId() &&
        message.getSender().uid === this.props.item.uid
      ) {
        updateEditedMessage(message);
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        this.loggedInUser.uid === message.getSender().uid &&
        message.getReceiverId() === this.props.item.uid
      ) {
        updateEditedMessage(message);
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * handler for updating messageList via newMessageObj
   * @param message:message object
   */

  updateEditedMessage = (message) => {
    const messageList = [...this.props.messages];
    const messageKey = messageList.findIndex((m) => m.id === message.id);

    if (messageKey > -1) {
      const messageObj = messageList[messageKey];
      const newMessageObj = { ...messageObj, ...message };

      messageList.splice(messageKey, 1, newMessageObj);
      this.props.actionGenerated(actions.MESSAGE_UPDATED, messageList);
    }
  };

  /**
   * Handler if the message is read and delivered.
   * @param message: message object
   */

  messageReadAndDelivered = (message) => {
    // read receipts
    if (
      message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
      message.getSender().getUid() === this.props.item.uid &&
      message.getReceiver() === this.loggedInUser.uid
    ) {
      const messageList = [...this.props.messages];

      if (message.getReceiptType() === 'delivery') {
        // search for message
        const messageKey = messageList.findIndex(
          (m) => m.id === message.messageId,
        );

        if (messageKey > -1) {
          const messageObj = { ...messageList[messageKey] };
          const newMessageObj = {
            ...messageObj,
            deliveredAt: message.getDeliveredAt(),
          };
          messageList.splice(messageKey, 1, newMessageObj);

          this.props.actionGenerated(actions.MESSAGE_UPDATED, messageList);
        }
      } else if (message.getReceiptType() === 'read') {
        // search for message
        const messageKey = messageList.findIndex(
          (m) => m.id === message.messageId,
        );

        if (messageKey > -1) {
          const messageObj = { ...messageList[messageKey] };
          const newMessageObj = { ...messageObj, readAt: message.getReadAt() };
          messageList.splice(messageKey, 1, newMessageObj);

          this.props.actionGenerated(actions.MESSAGE_UPDATED, messageList);
        }
      }
    } else if (
      message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
      message.getReceiver().guid === this.props.item.guid
    ) {
      // not implemented
    }
  };

  /**
   * handler if the message is received
   * @param message: message object
   */
  messageReceived = (message) => {
    try {
      // new messages
      this.markMessageAsDelivered(message);
      if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverId() === this.props.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        this.props.actionGenerated(actions.MESSAGE_RECEIVED, [message]);
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.props.item.uid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        this.props.actionGenerated(actions.MESSAGE_RECEIVED, [message]);
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * handler for when a custom message is received.
   * @param message: message object
   */
  customMessageReceived = (message) => {
    try {
      // new messages
      if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverId() === this.props.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        if (Object.prototype.hasOwnProperty.call(message, 'metadata')) {
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        } else if (message.type === enums.CUSTOM_TYPE_STICKER) {
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        } else if (message.type === enums.CUSTOM_TYPE_POLL) {
          // custom data (poll extension) does not have metadata

          const newMessage = this.addMetadataToCustomData(message);
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            newMessage,
          ]);
        } else if (message.type === enums.CUSTOM_TYPE_MEETING) {
          // custom data (poll extension) does not have metadata
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        }
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.props.item.uid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        if (Object.prototype.hasOwnProperty.call(message, 'metadata')) {
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        } else if (message.type === enums.CUSTOM_TYPE_STICKER) {
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        } else if (message.type === enums.CUSTOM_TYPE_POLL) {
          // custom data (poll extension) does not have metadata
          const newMessage = this.addMetadataToCustomData(message);
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            newMessage,
          ]);
        }
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.loggedInUser.uid
      ) {
        if (message.type === enums.CUSTOM_TYPE_POLL) {
          // custom data (poll extension) does not have metadata
          this.props.actionGenerated(actions.CUSTOM_MESSAGE_RECEIVED, [
            message,
          ]);
        }
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Handler for adding meta data to custom data i.e polls.
   * @param message: message object
   */
  addMetadataToCustomData = (message) => {
    const { customData } = message.data;
    const { options } = customData;

    const resultOptions = {};
    options.map((option) => {
      resultOptions[option] = {
        text: options[option],
        count: 0,
      };
    });

    const polls = {
      id: message.id,
      options,
      results: {
        total: 0,
        options: resultOptions,
        question: customData.question,
      },
      question: customData.question,
    };

    return {
      ...message,
      metadata: { '@injected': { extensions: { polls } } },
    };
  };

  /**
   * call updated
   * @param message: message object
   */
  callUpdated = (message) => {
    try {
      if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverId() === this.props.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        this.props.actionGenerated(actions.CALL_UPDATED, message);
      } else if (
        this.props.type === CometChat.RECEIVER_TYPE.USER &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.USER &&
        message.getSender().uid === this.props.item.uid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        this.props.actionGenerated(actions.CALL_UPDATED, message);
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * handler when the group is updated and reciever type is group
   * @param key: action name
   * @param message: message object
   * @param grup: group object
   * @param options: options
   */

  groupUpdated = (key, message, group, options) => {
    try {
      if (
        this.props.type === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
        message.getReceiver().guid === this.props.item.guid
      ) {
        if (!message.getReadAt()) {
          CometChat.markAsRead(message);
        }

        this.props.actionGenerated(
          actions.GROUP_UPDATED,
          message,
          key,
          group,
          options,
        );
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * On message click handler
   * @param message: object message
   */
  handleClick = (message) => {
    this.props.onItemClick(message, 'message');
  };

  /**
   * handler for fetching sender message component of different types
   * @param message:message object
   * @param key
   */
  getSenderMessageComponent = (message, key) => {
    let component;
    if (Object.prototype.hasOwnProperty.call(message, 'deletedAt')) {
      component = (
        <CometChatDeleteMessageBubble
          theme={this.props.theme}
          key={key}
          item={this.props.item}
          type={this.props.type}
          message={message}
          messageOf={enums.MESSAGE_OF_SENDER}
        />
      );
    } else {
      switch (message.type) {
        case CometChat.MESSAGE_TYPE.TEXT:
          component = message.text ? (
            <CometChatSenderTextMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
              messageId={this.state.messageId}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.IMAGE:
          component = message.data?.url ? (
            <CometChatSenderImageMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.FILE:
          component = message.data.attachments ? (
            <CometChatSenderFileMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.VIDEO:
          component = message.data.url ? (
            <CometChatSenderVideoMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          component = message.data.url ? (
            <CometChatSenderAudioMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        default:
          break;
      }
    }

    return component;
  };

  /**
   * handler for fetching receiver message component of different types
   * @param message: message object
   * @param key: key object
   */

  getReceiverMessageComponent = (message, key) => {
    let component;

    if (Object.prototype.hasOwnProperty.call(message, 'deletedAt')) {
      component = (
        <CometChatDeleteMessageBubble
          theme={this.props.theme}
          key={key}
          message={message}
          messageOf={enums.MESSAGE_OF_RECEIVER}
        />
      );
    } else {
      switch (message.type) {
        case 'message':
        case CometChat.MESSAGE_TYPE.TEXT:
          component = message.text ? (
            <CometChatReceiverTextMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
              messageId={this.state.messageId}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.IMAGE:
          component = message.data.url ? (
            <CometChatReceiverImageMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.FILE:
          component = message.data.attachments ? (
            <CometChatReceiverFileMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.AUDIO:
          component = message.data.url ? (
            <CometChatReceiverAudioMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        case CometChat.MESSAGE_TYPE.VIDEO:
          component = message.data.url ? (
            <CometChatReceiverVideoMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              widgetconfig={this.props.widgetconfig}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          ) : null;
          break;
        default:
          break;
      }
    }
    return component;
  };

  /**
   * handler for fetching custom message component from sender.
   * @param message: message object
   * @param key: key object
   */

  getSenderCustomMessageComponent = (message, key) => {
    let component;
    if (Object.prototype.hasOwnProperty.call(message, 'deletedAt')) {
      component = (
        <CometChatDeleteMessageBubble
          theme={this.props.theme}
          key={key}
          item={this.props.item}
          type={this.props.type}
          message={message}
          messageOf={enums.MESSAGE_OF_SENDER}
        />
      );
    } else {
      switch (message.type) {
        case enums.CUSTOM_TYPE_POLL:
          component = (
            <CometChatSenderPollMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          );
          break;
        case enums.CUSTOM_TYPE_STICKER:
          component = (
            <CometChatSenderStickerMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          );
          break;
        case 'meeting':
          component = (
            <CometChatSenderDirectCallBubble
              loggedInUser={this.loggedInUser}
              key={key}
              message={message}
              {...this.props}
              actionGenerated={this.props.actionGenerated}
            />
          );
          break;
        default:
          break;
      }
    }
    return component;
  };

  /**
   * handler for fetching custom message component from receiver
   * @param
   */
  getReceiverCustomMessageComponent = (message, key) => {
    let component;
    if (Object.prototype.hasOwnProperty.call(message, 'deletedAt')) {
      component = (
        <CometChatDeleteMessageBubble
          theme={this.props.theme}
          key={key}
          item={this.props.item}
          type={this.props.type}
          message={message}
          messageOf={enums.MESSAGE_OF_RECEIVER}
        />
      );
    } else {
      switch (message.type) {
        case enums.CUSTOM_TYPE_POLL:
          component = (
            <CometChatReceiverPollMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              actionGenerated={this.props.actionGenerated}
              showMessage={this.props?.showMessage}
            />
          );
          break;
        case enums.CUSTOM_TYPE_STICKER:
          component = (
            <CometChatReceiverStickerMessageBubble
              loggedInUser={this.loggedInUser}
              theme={this.props.theme}
              key={key}
              item={this.props.item}
              type={this.props.type}
              message={message}
              actionGenerated={this.props.actionGenerated}
            />
          );
          break;
        case 'meeting':
          component = (
            <CometChatReceiverDirectCallBubble
              loggedInUser={this.loggedInUser}
              key={key}
              message={message}
              actionGenerated={this.props.actionGenerated}
              {...this.props}
            />
          );
          break;
        default:
          break;
      }
    }

    return component;
  };

  /**
   * handler for fetching call message component (action message bubble)
   * @param message:message object
   * @param key
   */

  getCallMessageComponent = (message, key) => {
    return (
      <CometChatActionMessageBubble
        message={message}
        key={key}
        theme={this.props.theme}
        loggedInUser={this.loggedInUser}
      />
    );
  };

  /**
   * get action message component
   * @param
   */
  getActionMessageComponent = (message, key) => {
    let component = null;
    if (message.message) {
      component = (
        <View style={styles.actionMessageStyle} key={key}>
          <Text style={styles.actionMessageTxtStyle}>{message.message}</Text>
        </View>
      );

      // if action messages are set to hide in config
      if (this.props.messageConfig) {
        const found = this.props.messageConfig.find((cfg) => {
          return (
            cfg.action === message.action && cfg.category === message.category
          );
        });

        if (found && found.enabled === false) {
          component = null;
        }
      }
    }

    return component;
  };

  /**
   * get component for all fetching all components(parent function)
   * @param message: object message
   * @param key
   */
  getComponent = (message, key) => {
    let component;
    switch (message.category) {
      case 'action':
        component = this.getActionMessageComponent(message, key);
        break;
      case 'call':
        component = this.getCallMessageComponent(message, key);
        break;
      case 'message':
        if (
          this.loggedInUser.uid === message?.sender?.uid ||
          this.loggedInUser.uid === message?.data?.sender?.uid
        ) {
          component = this.getSenderMessageComponent(message, key);
        } else {
          component = this.getReceiverMessageComponent(message, key);
        }
        break;
      case 'custom':
        if (this.loggedInUser.uid === message.sender.uid) {
          component = this.getSenderCustomMessageComponent(message, key);
        } else {
          component = this.getReceiverCustomMessageComponent(message, key);
        }

        break;
      default:
        break;
    }

    return component;
  };

  listEmptyComponent = () => {
    return (
      <View style={[styles.chatListStyle]}>
        <View style={styles.decoratorMessageStyle}>
          <Text
            style={[
              styles.decoratorMessageTxtStyle,
              {
                color: `${this.props.theme.color.secondary}`,
              },
            ]}>
            {this.decoratorMessage}
          </Text>
        </View>
      </View>
    );
  };

  renderItem = ({ item, index }) => {
    let messages = [...this.props.messages];
    let currentDate = new Date().toDateString();
    if (messages.length) {
      messages = messages.reverse();
      if (!cDate) {
        // cDate = new Date(messages[0].sentAt * 1000).toDateString();
        const date = new Date(messages[0].sentAt * 1000);
        
        cDate = moment(messages[0].sentAt * 1000, 'ddd DD MMM YYYY').format("ll")
      }
    } else if (messages.length == 0) {

    }
    const message = item;
    let dateSeparator = null;
    let chatSuggestion = null;
    const nextMessage = messages[index + 1];
    const messageSentDate = nextMessage
      ? new Date(nextMessage.sentAt * 1000).toDateString()
      : null;
    if (cDate !== messageSentDate && messages[0].sentAt) {
      let dateValue = null;
      if (cDate == currentDate) {
        dateValue = moment(messages[0].sentAt * 1000).format('ll')
      }
      else if (new Date() - new Date(messages[0].sentAt * 1000) == 1) {
        dateValue = 'Yesterday';
      }
      else {
        dateValue = moment(cDate, 'ddd DD MMM YYYY').format("ll")
      }
      dateSeparator = (
        <View style={[styles.messageDateContainerStyle]}>
          <Text
            style={styles.messageDateStyle}>
            {dateValue}
          </Text>
        </View>
      );
    }
    cDate =
      messageSentDate ||
      new Date(messages[0].sentAt * 1000).toDateString();
    return (
      <View className='mt-1'>
        {index ? dateSeparator : null}
        {this.getComponent(message)}
        {(item.data.customData?.tag === 'first-message' && this.user_details.role_id == 5) ? this.chat_suggestions() : null}
      </View>
    );
  };

  chat_suggestions = () => {
    return (
      <View className='w-[80%] py-5 ml-[18%] rounded-[6px] px-3 mb-4' style={{ backgroundColor: this.primaryColor }}>
        <View>
          <Text className='text-whiteColor text-[14px] font-InterMedium font-semibold leading-5 tracking-[0.44px]'>Choose a question or type your own</Text>
        </View>
        <View className='w-full flex flex-col bg-whiteColor rounded-[4px] mt-4 h-fit'>
          {
            this.state.suggestionsData?.suggested_question_1 === '' ||
              this.state.suggestionsData?.suggested_question_1 == null ||
              this.state.suggestionsData?.suggested_question_1 == undefined ?
              null
              :
              <Pressable className='w-full border-b-[1px] border-b-greyColor50 py-4 px-3' onPress={() => { this.sendMessage(this.state.suggestionsData?.suggested_question_1) }}>
                <Text className='text-greyBorder text-[14px] font-InterLight font-normal leading-5 tracking-[0.44px]'>{this.state.suggestionsData?.suggested_question_1}</Text>
              </Pressable>
          }
          {
            this.state.suggestionsData?.suggested_question_2 === '' ||
              this.state.suggestionsData?.suggested_question_2 == null ||
              this.state.suggestionsData?.suggested_question_2 == undefined ?
              null
              :
              <Pressable className='w-full border-b-[1px] border-b-greyColor50 py-4 px-3' onPress={() => { this.sendMessage(this.state.suggestionsData?.suggested_question_2) }}>
                <Text className='text-greyBorder text-[14px] font-InterLight font-normal leading-5 tracking-[0.44px]'>{this.state.suggestionsData?.suggested_question_2}</Text>
              </Pressable>
          }
          {
            this.state.suggestionsData?.suggested_question_3 === '' ||
              this.state.suggestionsData?.suggested_question_3 == null ||
              this.state.suggestionsData?.suggested_question_3 == undefined ?
              null
              :
              <Pressable className='w-full py-4 px-3' onPress={() => { this.sendMessage(this.state.suggestionsData?.suggested_question_3) }}>
                <Text className='text-greyBorder text-[14px] font-InterLight font-normal leading-5 tracking-[0.44px]'>{this.state.suggestionsData?.suggested_question_3}</Text>
              </Pressable>
          }
        </View>
      </View>
    )
  }

  sendMessage = (suggested_message) => {
    const { receiverId, receiverType } = this.getReceiverDetails();
    // const messageInput = this.state.messageInput.trim();
    const conversationId = this.props.getConversationId();
    const textMessage = new CometChat.TextMessage(
      receiverId,
      suggested_message,
      receiverType,
    );
    textMessage.setSender(this.loggedInUser);
    textMessage.setReceiver(receiverType);
    textMessage.setText(suggested_message);
    textMessage.setConversationId(conversationId);
    textMessage._composedAt = Date.now();
    textMessage._id = '_' + Math.random().toString(36).substr(2, 9);
    textMessage.setId(textMessage._id)
    this.props.actionGenerated(actions.MESSAGE_COMPOSED, [textMessage]);
    this.setState({ suggested_message: '' });
    // this.messageInputRef.current.textContent = '';

    CometChat.sendMessage(textMessage)
      .then((message) => {
        const newMessageObj = { ...message, _id: textMessage._id };
        this.setState({ suggested_message: '' });
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
  }

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

  newMsgComponent = () => {
    if (this.yOffset > 50) {
      this.setState({ showNewMsg: true });
    }
  };
  renderCheckboxItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.fieldGrayColor,
        backgroundColor: isSelected ? this.primaryColor : Colors.white,
      }}
    >
      <Text style={{ color: isSelected ? Colors.white : Colors.greyBorder, fontSize: 12 }}>
        {item.label}
      </Text>
      <View style={{ flex: 1 }} />
      {isSelected && (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors.greyBorder,
            backgroundColor: Colors.white,
          }}
        >
          {/* You can customize the checkmark here */}
          {isSelected && (
            <View
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: this.primaryColor,
              }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );


  render() {
    const result = Object.values(
      this.props.messages.reduce((msg, obj) => ({ ...msg, [obj?.rawMessage?.id]: obj }), {})
    );
    let messages = [...result];
    if (messages.length) {
      messages = messages.reverse();
    }

    // let t = setTimeout(() => {
    //   let messageIndex = null
    //   if (this.state.messageId !== null) {
    //     messageIndex = messages.findIndex(t => t.id === this.state.messageId)
    //     if (messageIndex !== -1) {
    //       this.flatListRef.current.scrollToIndex({ index: messageIndex })
    //     }
    //   } else {
    //     clearTimeout(t)
    //   }
    // }, 1500)

    let newMsgPopUp = (
      <View style={styles.newMessagePopupContainer}>
        <TouchableOpacity
          onPress={() => {
            this.setState({ showNewMsg: null }, () => {
              this.flatListRef.current.scrollToOffset({
                offset: 0,
                animated: true,
              });
            });
          }}
          style={styles.newMessageTextContainer}>
          <Text>New message</Text>
          <Icon
            name="arrow-down"
            style={{ marginLeft: 5 }}
            size={15}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    );
    let ITEM_WIDTH = 70
    return (
      <>
        <FlatList
          ref={this.flatListRef}
          ListEmptyComponent={this.listEmptyComponent}
          onScroll={(event) => {
            this.yOffset = event.nativeEvent.contentOffset.y;
            if (this.yOffset > 50 && this.state.showNewMsg) {
              this.setState({ showNewMsg: false });
            }
          }}
          scrollEventThrottle={16}
          // onEndReached={() => this.getMessages(true)}
          onEndReachedThreshold={0.3}
          inverted={messages.length > 0}
          style={{ flex: 1, paddingHorizontal: 5 }}
          contentContainerStyle={!messages.length ? { flex: 1 } : {}}
          ListFooterComponent={
            messages.length && this.props.parentMessageComponent
              ? this.props.parentMessageComponent
              : null
          }
          data={messages}
          keyExtractor={(item, index) => item.messageId + '_' + index}
          renderItem={this.renderItem}
          getItemLayout={(data, index) => (
            { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
          )}
        />
        {this.state.showNewMsg ? newMsgPopUp : null}
      </>
    );
  }
}

const styles1 = StyleSheet.create({
  container1: { height: 55, marginLeft: 10, marginTop: 5 },
  container2: { width: '47%', height: 55, marginRight: 10, marginLeft: 4, marginTop: 5 },
  dropdown: {
    height: 50,
    backgroundColor: Colors.fieldGrayColor,
    borderRadius: 4,
    padding: 12,
  },
  dropdown2: {
    height: 50,
    backgroundColor: Colors.fieldGrayColor,
    // borderRadius: 12,
    padding: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.greyBorder
  },
  selectedTextStyle: {
    fontSize: 14,
    color: Colors.greyBorder
  },
  iconStyle: {
    width: 20,
    height: 20
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
});

export default CometChatMessageList;
