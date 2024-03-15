/* eslint-disable no-param-reassign */
/* eslint-disable react/no-did-update-set-state */
/* eslint-disable radix */
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl } from 'react-native'
import { CometChat } from '@cometchat-pro/react-native-chat';
import { CometChatManager } from '../../../utils/controller';
import { ConversationListManager } from './controller';
import * as enums from '../../../utils/enums';
import * as consts from '../../../utils/consts';
import CometChatConversationListItem from '../CometChatConversationListItem';
import theme from '../../../resources/theme';
import styles from './styles';
import Sound from 'react-native-sound';
import DropDownAlert from '../../Shared/DropDownAlert';
import { UIKitSettings } from '../../../utils/UIKitSettings';
import {
  CometChatContextProvider,
  CometChatContext,
} from '../../../utils/CometChatContext';
import { incomingOtherMessageAlert } from '../../../resources/audio';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { logger } from '../../../utils/common';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Icons, Images } from '../../../../../../assets/Images';
import FastImage from 'react-native-fast-image';
import { Colors } from '../../../../../../common/Colors';
import Header from '../../../../../../screens/prospect/header/Header';
import { useSelector } from 'react-redux';
import * as AmbassadorServices from '../../../../../../../src/services/prospect/ambassadors/AmbassadorsServices';
import { Utils } from '../../../../../../common/Utils';
import { COMETCHAT_CONSTANTS } from '../../../../../../CONSTS';
import { any } from 'prop-types';
import { CometChatUserList, CometChatUserListWithMessages } from '../../Users';
import Modal from "react-native-modal";
import BlockListUsers from './BlockListUsers';
import { setCometChatInfo } from '../../../../../../redux/action/CometChatAction';
import { connect } from 'react-redux'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Fontisto from 'react-native-vector-icons/Fontisto'
import * as AuthServices from '../../../../../../services/auth/AuthServices';
import moment from 'moment';

const FilteredList = ({ item, searchTxt, handleClick, get_decrypted_name, screenWidth, cometchat_uid, primaryColor, config, selectedConversation, loggedInUser }) => {
  if (item.category === 'action') {
    return null
  }
  else if (item.type == 'chat' && searchTxt && searchTxt != null) {
    let { sender, receiver } = item.data?.entities
    let conversation = {
      conversationType: "user",
      conversationWith: {
        avatar: cometchat_uid === sender?.entity.uid ? receiver?.entity.avatar : item.data.entities?.sender?.entity.avatar,
        blockedByMe: false,
        conversationId: item.conversationId,
        deactivatedAt: 0,
        hasBlockedMe: false,
        lastActiveAt: item.data.entities.sender?.entity.lastActiveAt,
        name: cometchat_uid === sender?.entity?.uid ? receiver?.entity.name : item.data?.entities.sender?.entity.name,
        role: cometchat_uid === sender?.entity?.uid ? receiver?.entity.role : item.data?.entities.sender?.entity.role,
        status: cometchat_uid === sender?.entity?.uid ? receiver?.entity.status : item?.data.entities?.sender?.entity.status,
        uid: cometchat_uid === sender?.entity?.uid ? receiver?.entity.uid : item.data?.entities.sender?.entity.uid,
        messageId: item.id
      }
    }
    let searchTextLower = searchTxt.trim().toLowerCase();
    let textLower = item.data?.text?.toLowerCase();
    let index = textLower?.indexOf(searchTextLower);

    let textParts = [
      item.data?.text?.substring(0, index).toLowerCase(),
      item.data?.text?.substring(index, index + searchTextLower.length).toLowerCase(),
      item.data?.text?.substring(index + searchTextLower.length).toLowerCase()
    ];

    return (
      <TouchableOpacity className='px-5 py-3 flex flex-row justify-between items-center w-full'
        onPress={() => { handleClick(conversation) }}>
        <View>
          <View style={{ width: screenWidth - 30 }} className={`flex-row items-center justify-between `}>
            <Text numberOfLines={1} className='text-textColor text-xl font-HelveticaBold font-bold w-[75%] '>{get_decrypted_name(cometchat_uid === sender?.entity.uid ? receiver?.entity.name : item.data.entities.sender?.entity.name)}</Text>
            <Text className='text-greyBorder mt-[5pxs] text-[12px] font-InterSemiBold font-normal'>{moment(item.sentAt * 1000).format('ll')}</Text>
          </View>
          {
            cometchat_uid === sender?.entity?.uid ?
              <Text className={`text-greyBorder text-sm font-InterRegular font-normal`}>
                You: {textParts.map((part, i) => (
                  <Text key={i} style={{ backgroundColor: i == 1 ? primaryColor : Colors.transparent, color: i == 1 ? Colors.white : Colors.greyBorder }}>{part}</Text>
                ))}
              </Text>
              :
              <Text className={`text-greyBorder text-sm font-InterRegular font-normal`}>
                {textParts.map((part, i) => (
                  <Text key={i} style={{ backgroundColor: i == 1 ? primaryColor : Colors.transparent, color: i == 1 ? Colors.white : Colors.greyBorder }}>{part}</Text>
                ))}
              </Text>
          }
        </View>
      </TouchableOpacity>
    )
  }
  else {
    return (
      <CometChatConversationListItem
        theme={theme}
        config={config}
        conversation={item}
        selectedConversation={selectedConversation}
        loggedInUser={loggedInUser}
        handleClick={handleClick}
        item={item}
        primaryColor={primaryColor}
      />
    )
  }
}


class CometChatConversationList extends React.Component {
  loggedInUser = null;
  decoratorMessage = 'Loading...';
  primaryColor = ''
  static contextType = CometChatContext;
  cometchat_uid = ''
  screenWidth = Dimensions.get('window').width;
  constructor(props) {
    super(props);
    this.state = {
      conversationList: [],
      filteredConversationList: [],
      selectedConversation: undefined,
      showSmallHeader: false,
      isMessagesSoundEnabled: true,
      searchTxt: '',
      filteredChatData: [],
      searchVisible: false,
      ambassadorList: [],
      isLoading: false,
      blockedUsersList: [],
      seeBlockList: false,
      refreshing: false,
      allMessages: []
    };
    this.chatListRef = React.createRef();
    this.theme = { ...theme, ...this.props.theme };
    Sound.setCategory('Ambient', true);
    this.audio = new Sound(incomingOtherMessageAlert);
    this.UIKitSettingsBuilder = new UIKitSettings();
  }

  componentDidMount() {
    this.getCometuID()
    this.decoratorMessage = 'Loading...';
    if (this.ConversationListManager) {
      this.ConversationListManager.removeListeners();
    }
    this.ConversationListManager = new ConversationListManager();
    this.getConversations();
    this.getAmbassadorList()
    this.ConversationListManager.attachListeners(this.conversationUpdated);
    this.checkRestrictions();
    try {
      this.navListener = this.props.navigation.addListener('focus', () => {
        this.decoratorMessage = 'Loading...';
        if (this.ConversationListManager) {
          this.ConversationListManager.removeListeners();
        }
        this.ConversationListManager = new ConversationListManager();
        this.getConversations();
        this.ConversationListManager.attachListeners(this.conversationUpdated);
        this.checkRestrictions();
      });
    } catch (error) {
      logger(error);
    }
  }

  checkRestrictions = async () => {
    let isMessagesSoundEnabled =
      await this.context.FeatureRestriction.isMessagesSoundEnabled();
    this.setState({ isMessagesSoundEnabled });
  };
  onRefresh = () => {
    this.setState({ refreshing: true })
    this.getConversations();
    this.setState({ refreshing: false })
  };

  componentDidUpdate(prevProps) {
    // this.getMessages();
    try {
      const previousItem = JSON.stringify(prevProps.item);
      const currentItem = JSON.stringify(this.props.item);
      // if different conversation is selected
      if (previousItem !== currentItem) {
        if (Object.keys(this.props.item).length === 0) {
          this.chatListRef.scrollTop = 0;
          this.setState({ selectedConversation: {} });
        } else {
          const conversationList = [...this.state.conversationList];
          let t = conversationList.filter((t) => t.unreadMessageCount > 0)
          this.props.increaseMessageCount(t.length)

          const conversationObj = conversationList.find((c) => {
            if (
              (c.conversationType === this.props.type &&
                this.props.type === 'user' &&
                c.conversationWith.uid === this.props.item.uid) ||
              (c.conversationType === this.props.type &&
                this.props.type === CometChat.ACTION_TYPE.TYPE_GROUP &&
                c.conversationWith.guid === this.props.item.guid)
            ) {
              return c;
            }

            return false;
          });

          if (conversationObj) {
            const conversationKey = conversationList.indexOf(conversationObj);
            const newConversationObj = {
              ...conversationObj,
              unreadMessageCount: 0,
            };

            conversationList.splice(conversationKey, 1, newConversationObj);
            this.setState({
              conversationList,
              selectedConversation: newConversationObj,
            });
          }
        }
      }

      // if user is blocked/unblocked, update conversationList in state
      if (
        prevProps.item &&
        Object.keys(prevProps.item).length &&
        prevProps.item.uid === this.props.item.uid &&
        prevProps.item.blockedByMe !== this.props.item.blockedByMe
      ) {
        const conversationList = [...this.state.conversationList];
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)

        // search for user
        const convKey = conversationList.findIndex(
          (c) =>
            c.conversationType === 'user' &&
            c.conversationWith.uid === this.props.item.uid,
        );
        if (convKey > -1) {
          conversationList.splice(convKey, 1);

          this.setState({ conversationList });
        }
      }

      if (
        prevProps.groupToUpdate &&
        (prevProps.groupToUpdate.guid !== this.props.groupToUpdate.guid ||
          (prevProps.groupToUpdate.guid === this.props.groupToUpdate.guid &&
            (prevProps.groupToUpdate.membersCount !==
              this.props.groupToUpdate.membersCount ||
              prevProps.groupToUpdate.scope !==
              this.props.groupToUpdate.scope)))
      ) {
        const conversationList = [...this.state.conversationList];
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        const { groupToUpdate } = this.props;

        const convKey = conversationList.findIndex(
          (c) =>
            c.conversationType === 'group' &&
            c.conversationWith.guid === groupToUpdate.guid,
        );
        if (convKey > -1) {
          const convObj = conversationList[convKey];

          const convWithObj = { ...convObj.conversationWith };

          const newConvWithObj = {
            ...convWithObj,
            scope: groupToUpdate.scope,
            membersCount: groupToUpdate.membersCount,
          };
          const newConvObj = { ...convObj, conversationWith: newConvWithObj };

          conversationList.splice(convKey, 1, newConvObj);
          this.setState({ conversationList });
        }
      }

      if (prevProps.messageToMarkRead !== this.props.messageToMarkRead) {
        const message = this.props.messageToMarkRead;
        this.makeConversation(message)
          .then((response) => {
            const { conversationKey, conversationObj, conversationList } =
              response;
            let t = conversationList.filter((t) => t.unreadMessageCount > 0)
            this.props.increaseMessageCount(t.length)

            if (conversationKey > -1) {
              const unreadMessageCount = this.makeUnreadMessageCount(
                conversationObj,
                'decrement',
              );
              const lastMessageObj = this.makeLastMessage(
                message,
                conversationObj,
              );

              const newConversationObj = {
                ...conversationObj,
                lastMessage: lastMessageObj,
                unreadMessageCount,
              };
              conversationList.splice(conversationKey, 1);
              conversationList.unshift(newConversationObj);
              this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
            }
          })
          .catch((error) => {
            const errorCode = error?.message || 'ERROR';
            this.dropDownAlertRef?.showMessage('error', errorCode);
            logger(
              'This is an error in converting message to conversation',
              error,
            );
          });
      }

      if (prevProps.lastMessage !== this.props.lastMessage) {
        const { lastMessage } = this.props;
        const conversationList = [...this.state.conversationList];
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        const conversationKey = conversationList.findIndex(
          (c) => c.conversationId === lastMessage.conversationId,
        );

        if (conversationKey > -1) {
          const conversationObj = conversationList[conversationKey];
          const newConversationObj = { ...conversationObj, lastMessage };

          conversationList.splice(conversationKey, 1);
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
        } else {
          // TODO: dont know what to do here
          const chatListMode = this.UIKitSettingsBuilder.chatListMode;
          const chatListFilterOptions = UIKitSettings.chatListFilterOptions;
          if (chatListMode !== chatListFilterOptions['USERS_AND_GROUPS']) {
            if (
              (chatListMode === chatListFilterOptions['USERS'] &&
                lastMessage.receiverType === CometChat.RECEIVER_TYPE.GROUP) ||
              (chatListMode === chatListFilterOptions['GROUPS'] &&
                lastMessage.receiverType === CometChat.RECEIVER_TYPE.USER)
            ) {
              return false;
            }
          }

          const getConversationId = () => {
            let conversationId = null;
            if (this.getContext().type === CometChat.RECEIVER_TYPE.USER) {
              const users = [this.loggedInUser.uid, this.getContext().item.uid];
              conversationId = users.sort().join('_user_');
            } else if (
              this.getContext().type === CometChat.RECEIVER_TYPE.GROUP
            ) {
              conversationId = `group_${this.getContext().item.guid}`;
            }

            return conversationId;
          };

          let newConversation = new CometChat.Conversation();
          newConversation.setConversationId(getConversationId());
          newConversation.setConversationType(this.getContext().type);
          newConversation.setConversationWith(this.getContext().item);
          newConversation.setLastMessage(lastMessage);
          newConversation.setUnreadMessageCount(0);

          conversationList.unshift(newConversation);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          // this.getContext().setLastMessage({});
        }
      }

      if (
        prevProps.groupToDelete &&
        prevProps.groupToDelete.guid !== this.props.groupToDelete.guid
      ) {
        let conversationList = [...this.state.conversationList];
        const groupKey = conversationList.findIndex(
          (member) =>
            member.conversationWith.guid === this.props.groupToDelete.guid,
        );
        if (groupKey > -1) {
          conversationList.splice(groupKey, 1);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          if (conversationList.length === 0) {
            this.decoratorMessage = 'Welcome on board!';
          }
        }
      }
    } catch (error) {
      logger(error);
    }
  }

  componentWillUnmount() {
    try {
      if (this.ConversationListManager) {
        this.ConversationListManager.removeListeners();
      }
      this.ConversationListManager = null;
      if (this.navListener) this.navListener();
    } catch (error) {
      logger(error);
    }
  }

  /**
   * Handles live updates from server using listeners
   * @param key:action
   * @param item:object related to Users
   * @param message:object related to Messages
   * @param options: extra data
   * @param actionBy: user object of action taker
   */
  conversationUpdated = (key, item, message, options, actionBy) => {
    const chatListMode = this.UIKitSettingsBuilder.chatListMode;
    const chatListFilterOptions = UIKitSettings.chatListFilterOptions;

    if (chatListMode !== chatListFilterOptions['USERS_AND_GROUPS']) {
      if (
        (chatListMode === chatListFilterOptions['USERS'] &&
          message.receiverType === CometChat.RECEIVER_TYPE.GROUP) ||
        (chatListMode === chatListFilterOptions['GROUPS'] &&
          message.receiverType === CometChat.RECEIVER_TYPE.USER)
      ) {
        return false;
      }
    }
    try {
      switch (key) {
        case enums.USER_ONLINE:
        case enums.USER_OFFLINE:
          this.updateUser(item);
          break;
        case enums.TEXT_MESSAGE_RECEIVED:
        case enums.MEDIA_MESSAGE_RECEIVED:
        case enums.CUSTOM_MESSAGE_RECEIVED:
          this.updateConversation(message);
          this.markMessageAsDelivered(message);
          break;
        case enums.MESSAGE_EDITED:
        case enums.MESSAGE_DELETED:
          this.conversationEditedDeleted(message);
          break;
        case enums.INCOMING_CALL_RECEIVED:
        case enums.INCOMING_CALL_CANCELLED:
          this.updateConversation(message, false);
          break;
        case enums.GROUP_MEMBER_ADDED:
          if (this.loggedInUser.uid !== actionBy.uid)
            this.updateGroupMemberAdded(message, options);
          break;
        case enums.GROUP_MEMBER_KICKED:
        case enums.GROUP_MEMBER_BANNED:
        case enums.GROUP_MEMBER_LEFT:
          this.updateGroupMemberRemoved(message, options);
          break;
        case enums.GROUP_MEMBER_SCOPE_CHANGED:
          this.updateGroupMemberScopeChanged(message, options);
          break;
        case enums.GROUP_MEMBER_JOINED:
          this.updateGroupMemberChanged(message, options, 'increment');
          break;
        case enums.GROUP_MEMBER_UNBANNED:
          this.updateGroupMemberChanged(message, options, '');
          break;
        default:
          break;
      }
    } catch (error) {
      logger(error);
    }
  };
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
        '[CometChatConversationList markMessageAsDelivered] faailed to mark as deivered =',
        message,
      );
    }
  };

  /**
   * Handle update user details in existing conversation object
   * @param user:User Object
   */
  updateUser = (user) => {
    try {
      const conversationList = [...this.state.conversationList];
      let t = conversationList.filter((t) => t.unreadMessageCount > 0)
      this.props.increaseMessageCount(t.length)
      const conversationKey = conversationList.findIndex(
        (conversationObj) =>
          conversationObj.conversationType === 'user' &&
          conversationObj.conversationWith.uid === user.uid,
      );

      if (conversationKey > -1) {
        const conversationObj = { ...conversationList[conversationKey] };
        const conversationWithObj = {
          ...conversationObj.conversationWith,
          status: user.getStatus(),
        };

        const newConversationObj = {
          ...conversationObj,
          conversationWith: conversationWithObj,
        };
        conversationList.splice(conversationKey, 1, newConversationObj);
        this.setState({ conversationList });
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Play audio alert
   * @param
   */
  playAudio = () => {
    try {
      if (this.state.playingAudio || !this.state.isMessagesSoundEnabled) {
        return false;
      }

      this.setState({ playingAudio: true }, () => {
        this.audio.setCurrentTime(0);
        this.audio.play(() => {
          this.setState({ playingAudio: false });
        });
      });
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Retrieve conversation object from message
   * @param message : message object
   */
  makeConversation = (message) => {
    const promise = new Promise((resolve, reject) => {
      CometChat.CometChatHelper.getConversationFromMessage(message)
        .then((conversation) => {
          const conversationList = [...this.state.conversationList];
          let t = conversationList.filter((t) => t.unreadMessageCount > 0)
          this.props.increaseMessageCount(t.length)
          const conversationKey = conversationList.findIndex(
            (c) => c.conversationId === conversation.conversationId,
          );
          let conversationObj = { ...conversation };
          if (conversationKey > -1) {
            conversationObj = { ...conversationList[conversationKey] };
          }

          resolve({
            conversationKey,
            conversationObj,
            conversationList,
          });
        })
        .catch((error) => {
          throw error;
        });
    });

    return promise;
  };

  /**
   * Retrieve unread message count from conversation
   * @param conversation : conversation object
   * @param operator : extra option to handle decrease in unread message count
   */
  makeUnreadMessageCount = (conversation = {}, operator) => {
    try {
      if (Object.keys(conversation).length === 0) {
        return 1;
      }

      let unreadMessageCount = parseInt(conversation.unreadMessageCount);
      if (operator && operator === 'decrement') {
        unreadMessageCount = unreadMessageCount ? unreadMessageCount - 1 : 0;
      } else {
        unreadMessageCount += 1;
      }

      return unreadMessageCount;
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Retrieve message data
   * @param
   */
  makeLastMessage = (message) => {
    const newMessage = { ...message };
    return newMessage;
  };

  /**
   * Handle updating conversation object on any message
   * @param message: message object
   * @param notification: boolean to play audio alert @default : true
   */
  updateConversation = (message, notification = true) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          const unreadMessageCount = this.makeUnreadMessageCount(
            conversationList[conversationKey],
          );
          const lastMessageObj = this.makeLastMessage(message, conversationObj);

          const newConversationObj = {
            ...conversationObj,
            lastMessage: lastMessageObj,
            unreadMessageCount,
          };
          conversationList.splice(conversationKey, 1);
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });

          if (notification) {
            this.playAudio(message);
          }
        } else {
          const unreadMessageCount = this.makeUnreadMessageCount();
          const lastMessageObj = this.makeLastMessage(message);

          const newConversationObj = {
            ...conversationObj,
            lastMessage: lastMessageObj,
            unreadMessageCount,
          };
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          if (notification) {
            this.playAudio(message);
          }
        }
      })
      .catch((error) => {
        logger('This is an error in converting message to conversation', error);
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
      });
  };

  /**
   * Handle editing/deleting conversation object
   * @param message: message object
   */
  conversationEditedDeleted = (message) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          const lastMessageObj = conversationObj.lastMessage;

          if (lastMessageObj.id === message.id) {
            const newLastMessageObj = { ...lastMessageObj, ...message };
            const newConversationObj = {
              ...conversationObj,
              lastMessage: newLastMessageObj,
            };
            conversationList.splice(conversationKey, 1, newConversationObj);
            this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          }
        }
      })
      .catch((error) => {
        logger('This is an error in converting message to conversation', error);
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
      });
  };

  /**
   * Handle updating group member in existing conversation objects
   * @param message: message object
   * @param options: contains user object for user added to group
   */
  updateGroupMemberAdded = (message, options) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          const unreadMessageCount =
            this.makeUnreadMessageCount(conversationObj);
          const lastMessageObj = this.makeLastMessage(message, conversationObj);

          const conversationWithObj = { ...conversationObj.conversationWith };
          const membersCount = parseInt(conversationWithObj.membersCount) + 1;
          const newConversationWithObj = {
            ...conversationWithObj,
            membersCount,
          };

          const newConversationObj = {
            ...conversationObj,
            conversationWith: newConversationWithObj,
            lastMessage: lastMessageObj,
            unreadMessageCount,
          };
          conversationList.splice(conversationKey, 1);
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          this.playAudio(message);
        } else if (options && this.loggedInUser.uid === options.user.uid) {
          const unreadMessageCount = this.makeUnreadMessageCount();
          const lastMessageObj = this.makeLastMessage(message);

          const conversationWithObj = { ...conversationObj.conversationWith };
          const membersCount = parseInt(conversationWithObj.membersCount) + 1;
          const scope = CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT;
          const { hasJoined } = options;

          const newConversationWithObj = {
            ...conversationWithObj,
            membersCount,
            scope,
            hasJoined,
          };
          const newConversationObj = {
            ...conversationObj,
            conversationWith: newConversationWithObj,
            lastMessage: lastMessageObj,
            unreadMessageCount,
          };
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          this.playAudio(message);
        }
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
        logger('This is an error in converting message to conversation', error);
      });
  };

  /**
   * Handle removing group member in existing conversation objects
   * @param message: message object
   * @param options: contains user object for user removed from group
   */
  updateGroupMemberRemoved = (message, options) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          if (options && this.loggedInUser.uid === options.user.uid) {
            conversationList.splice(conversationKey, 1);
            this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          } else {
            const unreadMessageCount =
              this.makeUnreadMessageCount(conversationObj);
            const lastMessageObj = this.makeLastMessage(
              message,
              conversationObj,
            );

            const conversationWithObj = { ...conversationObj.conversationWith };
            const membersCount = parseInt(conversationWithObj.membersCount) - 1;
            const newConversationWithObj = {
              ...conversationWithObj,
              membersCount,
            };

            const newConversationObj = {
              ...conversationObj,
              conversationWith: newConversationWithObj,
              lastMessage: lastMessageObj,
              unreadMessageCount,
            };
            conversationList.splice(conversationKey, 1);
            conversationList.unshift(newConversationObj);
            this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
            this.playAudio(message);
          }
        }
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
        logger('This is an error in converting message to conversation', error);
      });
  };

  /**
   * Handle updating group member scope in existing conversation objects
   * @param message: message object
   * @param options: contains user object for user whose scope is changed to group
   */
  updateGroupMemberScopeChanged = (message, options) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          const unreadMessageCount =
            this.makeUnreadMessageCount(conversationObj);
          const lastMessageObj = this.makeLastMessage(message, conversationObj);

          const conversationWithObj = { ...conversationObj.conversationWith };
          const membersCount = parseInt(conversationWithObj.membersCount);
          let { scope } = conversationWithObj;

          if (options && this.loggedInUser.uid === options.user.uid) {
            scope = options.scope;
          }

          const newConversationWithObj = {
            ...conversationWithObj,
            membersCount,
            scope,
          };
          const newConversationObj = {
            ...conversationObj,
            conversationWith: newConversationWithObj,
            lastMessage: lastMessageObj,
            unreadMessageCount,
          };
          conversationList.splice(conversationKey, 1);
          conversationList.unshift(newConversationObj);
          this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
          this.playAudio(message);
        }
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
        logger('This is an error in converting message to conversation', error);
      });
  };

  /**
   * Handle updating group members in existing conversation objects on member joined/unbanned
   * @param message: message object
   * @param options: contains user object for user added to group
   * @param operator: for incrementing member count
   */
  updateGroupMemberChanged = (message, options, operator) => {
    this.makeConversation(message)
      .then((response) => {
        const { conversationKey, conversationObj, conversationList } = response;
        let t = conversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)
        if (conversationKey > -1) {
          if (options && this.loggedInUser.uid !== options.user.uid) {
            const unreadMessageCount =
              this.makeUnreadMessageCount(conversationObj);
            const lastMessageObj = this.makeLastMessage(
              message,
              conversationObj,
            );

            const conversationWithObj = { ...conversationObj.conversationWith };
            let membersCount = parseInt(conversationWithObj.membersCount);
            if (operator === 'increment') {
              membersCount += 1;
            }

            const newConversationWithObj = {
              ...conversationWithObj,
              membersCount,
            };
            const newConversationObj = {
              ...conversationObj,
              conversationWith: newConversationWithObj,
              lastMessage: lastMessageObj,
              unreadMessageCount,
            };
            conversationList.splice(conversationKey, 1);
            conversationList.unshift(newConversationObj);
            this.setState({ conversationList: conversationList, filteredConversationList: conversationList });
            this.playAudio(message);
          }
        }
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
        logger('This is an error in converting message to conversation', error);
      });
  };

  /**
   * Handle clicking on list item
   * @param conversation: conversation object of the item clicked
   */
  handleClick = (conversation) => {
    try {
      if (!this.props.onItemClick) return;

      this.props.onItemClick(
        conversation.conversationWith,
        conversation.conversationType,
      );
    } catch (error) {
      logger(error);
    }
  };



  /**
   * Retrieve conversation list according to the logged in user
   * @param
   */
  getConversations = async () => {
    this.primaryColor = await Utils.getData('primaryColor')
    this.setState({ isLoading: true });
    if (this.state.searchTxt) {
      this.filterChatData(this.state.searchTxt)
    } else {
      new CometChatManager()
        .getLoggedInUser()
        .then((user) => {
          this.loggedInUser = user;
          this.ConversationListManager.fetchNextConversation()
            .then((conversationList) => {
              if (conversationList.length === 0) {
                if (this.props.user_detail?.role_id == 4) {
                  this.setState({ isLoading: false })
                  this.getAmbassadorList()
                  this.listEmptyContainer()
                } else {
                  this.setState({ isLoading: false, filteredConversationList: [], conversationList: [] })
                  this.getAmbassadorList()
                  this.listEmptyContainer()
                }
              } else {
                const result = [
                  ...conversationList,
                  ...this.state.conversationList
                ].filter((thing, index, self) =>
                  index === self.findIndex((t) =>
                    t.conversationId === thing.conversationId &&
                    t.conversationType === thing.conversationType
                  )
                )
                let t = result.filter((t) => t.unreadMessageCount > 0)
                this.props.increaseMessageCount(t.length)
                this.setState({
                  conversationList: [
                    // ...this.state.conversationList,
                    // ...conversationList,
                    ...result
                  ],
                  filteredConversationList: [...result],
                  isLoading: false
                });
              }
            })
            .catch((error) => {
              this.setState({ isLoading: false })
              this.decoratorMessage = 'Error';
              const errorCode = error?.message || 'ERROR';
              this.dropDownAlertRef?.showMessage('error', errorCode);
              logger(
                '[CometChatConversationList] getConversations fetchNext error',
                error,
              );
            });
        })
        .catch((error) => {
          this.setState({ isLoading: false })
          this.decoratorMessage = 'Error';
          logger(
            '[CometChatConversationList] getConversations getLoggedInUser error',
            error,
          );
        });
    }
  };

  get_decrypted_name = (name) => {
    let user_name = AuthServices.decrypt(name)
    return user_name
  }

  getMessages = async () => {
    let uid = await Utils.getData('ambassador_cometchat_uid')
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
          fetch(`https://${COMETCHAT_CONSTANTS.APP_ID}.api-us.cometchat.io/v3/messages?myMentionsOnly=false&mentionsWithBlockedInfo=false&mentionswithTagInfo=false&hideDeleted=true&limit=100`, options)
            .then(response => response.json())
            .then(response => {
              if (response?.data?.length < 0) {
              } else {
                this.setState({ allMessages: response?.data })
              }
            })
            .catch(
              err => console.error("Error while fetching blocked users list:", err)
            );
        }
      );
    } catch (error) {
      console.log("Error:", error);
    }
  }



  filterChatData = (text_search) => {
    const filter_data = this.state.conversationList
    if (text_search !== null && text_search !== '') {
      const filteredData = this.state.conversationList.filter((item) =>
        this.get_decrypted_name(item?.conversationWith?.name).trim().toLowerCase().indexOf(text_search.toLowerCase().trim()) !== -1
      );
      const msgFilteredData = this.state.allMessages?.filter((item) =>
        (item?.data?.text + " ").trim().toLowerCase().indexOf(text_search.toLowerCase().trim()) !== -1
      );

      let filteredChatData = [
        ...filteredData?.map(o => { return { ...o, type: 'contact' } }),
        ...msgFilteredData?.map(o => { return { ...o, type: 'chat' } })
      ]
      this.setState((prevState) => ({
        // filteredConversationList: filteredData,
        filteredConversationList: filteredChatData
      }));
    } else {
      this.setState((prevState) => ({
        filteredConversationList: filter_data,
      }));
    }
  };

  getAmbassadorList = async () => {
    let college_id = await Utils.getData('collegeId')
    let send_data = {
      user_type: 0,
      page_no: 1,
      college_id: college_id
    }
    try {
      let res = this.state.filteredConversationList.length == 0 ? await AmbassadorServices.get_ambassadors(send_data) : []
      if (res.statusCode == 200) {
        this.setState({ ambassadorList: res.data?.rows })
      }
    } catch (error) {
      console.log(error);
    }
  }


  click_search = () => {
    this.getMessages();
    this.setState((prevState) => ({
      searchVisible: true,
    }));
    // slideAnim.value = withSequence(
    //   withTiming(searchVisible ? 0 : 1, { duration: 500, easing: Easing.linear }),
    //   withDelay(searchVisible ? 0 : 50, withTiming(0, { duration: 500 }))
    // );
  };

  back_btn_click = () => {
    this.state.searchTxt = null;
    if (this.state.searchTxt) {
      this.setState({ searchVisible: true });
    } else {
      this.setState({ searchVisible: false });
      this.state.searchTxt = '';
    }

    // this.getConversations();
  };

  onchange_search_input = (e) => {
    let s = e.trim("")
    this.state.searchTxt = e;
    // this.setState({ searchTxt: e });
    this.filterChatData(e.trim(""))
  };

  fetchBlockedUsersList() {
    // this.setState({ seeBlockList: !this.state.seeBlockList })
    this.props.navigation.navigate('BlockListUsers', { theme: this.theme, primaryColor: this.primaryColor });
  }


  /**
   * header component for conversation list
   * @param
   */
  listHeaderComponent = () => {
    const { searchVisible } = this.state;
    return (
      <>
        {
          searchVisible ?
            <View className='flex flex-row items-center bg-whiteColor h-[70px] px-1 w-full'>
              <TouchableOpacity className='w-[36px] h-[36px]' onPress={() => { this.back_btn_click() }}>
                <FastImage source={Icons.IcBackBtn} resizeMode='contain' className='w-full h-full' tintColor={Colors.greyBorder} />
              </TouchableOpacity>
              <View className='flex rounded-[4px] bg-fieldGrayColor w-[88%] '>
                <TextInput
                  className=' w-full h-[50px] rounded-lg text-fieldTextColor leading-4 px-4'
                  placeholder='Search'
                  value={this.state.searchTxt}
                  onChangeText={(e) => { this.onchange_search_input(e) }}
                  placeholderTextColor={Colors.greyBorder}
                  autoComplete='off'
                  autoFocus={true}
                  selectionColor={Colors.greyBorder}
                />
              </View>
            </View>
            :
            <View className='flex flex-row justify-between items-center bg-whiteColor h-[70px] pl-[17px] pr-2 w-full'>
              <View className=''>
                <Text className='text-textColor text-xl font-Helvetica '>Conversations</Text>
              </View>
              <View className='flex flex-row w-[22%] justify-between items-center'>
                {
                  this.state.filteredConversationList?.length > 0 && this.props.user_detail?.role_id == 4 ?
                    <TouchableOpacity className='w-[26px] h-[27px]' onPress={() => { this.click_search() }}>
                      <FastImage source={Icons.IcSearch} resizeMode='center' className='w-full h-full' />
                    </TouchableOpacity>
                    :
                    <View className='w-[26px] h-[27px]'></View>
                }
                {
                  this.props.user_detail?.role_id == 4 ?
                    <TouchableOpacity className='w-[32px] h-[32px]' onPress={() => { this.fetchBlockedUsersList() }}>
                      {/* <FastImage source={Icons.IcThreeDot} resizeMode='center' className='w-full h-full' tintColor={this.primaryColor} /> */}
                      <FastImage source={Icons.IcBlockedUser} resizeMode='center' className='w-full h-full' tintColor={this.primaryColor} />
                    </TouchableOpacity>
                    : <></>
                }
              </View>
            </View>
        }


      </>

    );
  };

  /**
   * component to show if conversation list length is 0
   * @param
   */

  itemClicked = async (item) => {
    let p = await Utils.getData('prospect_cometchat_uid')
    let p_id = await Utils.getData('prospect_userId');
    let send_data = {
      prospect_uid: p,
      ambassador_uid: item.cometchat_uid,
      userId: p_id
    }
    const authKey = COMETCHAT_CONSTANTS.AUTH_KEY;
    try {
      AmbassadorServices.add_conversation_info(send_data).then((res) => {
        if (res.statusCode == 200) {
          CometChat.getLoggedinUser().then(
            user => {
              if (!user) {
                CometChat.login(p, authKey).then(
                  user => {
                    this.props.navigation.navigate('CometChatConversationListWithMessages', { item: item, type: 'user', loggedInUser: user })
                  }, error => {
                    console.log("Login failed with exception:", { error });
                  }
                );
              } else if (user) {
                this.props.navigation.navigate('CometChatConversationListWithMessages', { item: item, type: 'user', loggedInUser: user })
              }
            }, error => {
              console.log("Something went wrong", error);
            }
          );
        }

      })
    } catch (error) {
      console.log(error);
    }
  };

  renderAmbassadors = ({ item }) => {
    return (
      <View className='flex w-[157px] h-[175px] bg-whiteColor rounded-[10px] mt-5 mx-2' style={{ elevation: 3 }}>
        <View className='bg-greyColor50 w-full py-7 relative rounded-t-[10px]'>
          <TouchableOpacity onPress={() => { this.itemClicked(item) }} className='flex absolute w-20 h-20 rounded-full  border-whiteColor left-9 top-2 justify-center items-center bg-whiteColor'>
            <FastImage source={{ uri: item.user_detail?.profile_image }} resizeMode='cover' className='w-[70px] h-[70px] rounded-full' />
          </TouchableOpacity>
          <View className={`w-2 h-2 rounded-full ${item.current_status === 'available' ? 'bg-onlineColor' : 'bg-offlineColor'} absolute right-12 -bottom-5 mt-[1px]`}></View>
        </View>

        <View className='mt-10 flex justify-center items-center px-1'>
          <Text className='text-textColor font-bold text-[16px] leading-4' numberOfLines={1}>{item.user_detail?.first_name}</Text>
        </View>

        <View className='mt-2 pb-2 flex justify-center items-center px-3'>
          <Text numberOfLines={1} className='text-greyBorder font-InterRegular text-[12px] leading-5 text-center tracking-[0.44px]'>
            {item.user_detail?.Program.name}
          </Text>
        </View>
      </View>
    )
  }


  listEmptyContainer = () => {
    let role_id = this.props.user_detail?.role_id
    return (
      <>
        {
          this.state.isLoading == false && this.state.filteredConversationList.length == 0 ?
            role_id == 5 ?
              <View className='flex flex-1 relative bg-bgGrayColor'>
                <View className='flex flex-initial items-center justify-center h-[50%]'>
                  <View className='w-[100px] h-[100px]'>
                    <FastImage source={Images.emptychat} resizeMode='center' className='w-full h-full' />
                  </View>
                  <View className='mt-2'>
                    <Text className='text-greyBorder text-[19px]  leading-8  font-bold text-center'>
                      You don’t have any conversations yet
                    </Text>
                  </View>
                </View>
                <View className='flex flex-1 bg-bgGrayColor'>
                  <Text className='text-greyBorder text-[16px] font-InterRegular text-center leading-4 tracking-[0.44px]'>
                    Select an ambassador to start chatting
                  </Text>
                  <FlatList
                    className='ml-2'
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={this.state.ambassadorList}
                    renderItem={this.renderAmbassadors}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                  />
                </View>
              </View>
              :
              this.state.searchTxt ?
                <View className='flex flex-1 justify-center items-center mb-[20%]'>
                  <Text className='text-greyBorder text-[20px] tracking-[0.15px] leading-8 font-bold text-center'>No conversations yet.</Text>
                </View>
                :
                <View className='flex flex-1 justify-center items-center mb-[20%]'>
                  <View className='w-[100px] h-[100px]'>
                    <FastImage source={Images.handshak} resizeMode='center' className='w-full h-full' />
                  </View>
                  <View className='mt-2'>
                    <Text className='text-greyBorder text-[20px] tracking-[0.15px] leading-8 font-bold text-center'>
                      Welcome on board!
                    </Text>
                    <Text className='text-greyBorder text-[16px] tracking-[0.44px] leading-4 font-normal font-InterRegular text-center'>
                      Expect prospects to connect soon.
                    </Text>
                  </View>
                </View>
            :
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size={'large'} color={this.primaryColor} />
            </View>
        }
      </>
    );
  };

  /**
   * component for separating 2 conversation list items
   * @param
   */
  itemSeparatorComponent = ({ leadingItem }) => {
    if (leadingItem.header) {
      return null;
    }
    return (
      <View
        style={[
          styles.itemSeperatorStyle,
          {
            borderBottomColor: this.theme.borderColor.primary,
          },
        ]}
      />
    );
  };

  /**
   * check if scroll reached a particular point to handle headers
   * @param
   */
  handleScroll = ({ nativeEvent }) => {
    if (nativeEvent.contentOffset.y > 35 && !this.state.showSmallHeader) {
      this.setState({
        showSmallHeader: true,
      });
    }
    if (nativeEvent.contentOffset.y <= 35 && this.state.showSmallHeader) {
      this.setState({
        showSmallHeader: false,
      });
    }
  };

  /**
   * Handle end reached of conversation list
   * @param
   */
  endReached = () => {
    // if (this.state.filteredConversationList.length)
    //   this.getConversations();
  };

  deleteConversations = (conversation) => {
    let conversationWith =
      conversation.conversationType === CometChat.RECEIVER_TYPE.GROUP
        ? conversation?.conversationWith?.guid
        : conversation?.conversationWith?.uid;
    CometChat.deleteConversation(
      conversationWith,
      conversation.conversationType,
    )
      .then((deletedConversation) => {
        const newConversationList = [...this.state.conversationList];
        let t = newConversationList.filter((t) => t.unreadMessageCount > 0)
        this.props.increaseMessageCount(t.length)

        const conversationKey = newConversationList.findIndex(
          (c) => c.conversationId === conversation.conversationId,
        );

        newConversationList.splice(conversationKey, 1);
        this.setState({ conversationList: newConversationList, filteredConversationList: newConversationList });
      })
      .catch((error) => {
        logger(error);
      });
  };

  closeModal() {
    try {
      this.setState({ seeBlockList: false })
      this.getConversations()
    } catch (error) {
      console.log(error);
    }
  }

  getCometuID = async () => {
    this.cometchat_uid = await Utils.getData('ambassador_cometchat_uid');
  }

  renderFilteredList = (item) => {
    try {
      return (
        <FilteredList
          item={item}
          searchTxt={this.state.searchTxt}
          handleClick={this.handleClick}
          get_decrypted_name={this.get_decrypted_name}
          loggedInUser={this.loggedInUser}
          screenWidth={this.screenWidth}
          cometchat_uid={this.cometchat_uid}
          primaryColor={this.primaryColor}
          config={this.props.config}
          selectedConversation={this.state.selectedConversation}
        />
      )
    } catch (e) {
      console.log(e);
    }
  }



  render() {
    const screenHeight = Dimensions.get('window').height;
    const screenWidth = Dimensions.get('window').width;
    return (
      <CometChatContextProvider CometChatContextProvider ref={(el) => (this.contextProviderRef = el)}>
        <SafeAreaView style={{ backgroundColor: Colors.bgGrayColor }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.conversationWrapperStyle, { height: screenHeight - 150, position: 'relative' }]}>
            {this.listHeaderComponent()}
            {
              this.state.seeBlockList ?
                <TouchableOpacity
                  activeOpacity={0.3}
                  onPress={() => { this.props.navigation.navigate('BlockListUsers', { theme: this.theme, primaryColor: this.primaryColor }); this.setState({ seeBlockList: false }) }}
                  className='w-[200px] h-[80px] border-[1px] rounded-[4px] absolute right-3 top-[10.4%] flex justify-center items-center bg-whiteColor' style={{ borderColor: this.primaryColor, zIndex: 50 }}>
                  <Text className='text-greyBorder text-[12px] text-center font-InterRegular font-normal leading-5 tracking-[0.44px]'>Blocked conversations</Text>
                </TouchableOpacity>
                : null
            }
            <SwipeListView
              keyboardShouldPersistTaps='always'
              keyboardDismissMode='interactive'
              contentContainerStyle={styles.flexGrow1}
              data={this.state.searchTxt ? this.state.filteredConversationList : this.state.conversationList}
              keyExtractor={(item, index) => item?.conversationId + '_' + index}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.onRefresh}
                />}
              renderHiddenItem={(data, rowMap) => (
                this.props.user_detail?.role_id == 5 ?
                  <View
                    key={data.item?.conversationId}
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingLeft: 15,
                    }}>
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        bottom: 0,
                        justifyContent: 'center',
                        position: 'absolute',
                        top: 0,
                        width: 75,
                        backgroundColor: 'red',
                        right: 0,
                        maxHeight: 64,
                      }}
                      onPress={() => this.deleteConversations(data.item)}>
                      <Image
                        source={require('./resources/delete.png')}
                        resizeMode="contain"
                        style={{ height: 24 }}
                      />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View> :
                  data.type == 'contact' ?
                    <View
                      key={data.item?.conversationId}
                      style={{
                        alignItems: 'center',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingLeft: 15,
                        borderWidth: 1
                      }}>
                      <TouchableOpacity
                        style={{
                          alignItems: 'center',
                          bottom: 0,
                          justifyContent: 'center',
                          position: 'absolute',
                          top: 0,
                          width: 75,
                          backgroundColor: 'red',
                          right: 0,
                          maxHeight: 64,
                        }}
                        onPress={() => this.deleteConversations(data.item)}>
                        <Image
                          source={require('./resources/delete.png')}
                          resizeMode="contain"
                          style={{ height: 24 }}
                        />
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    :
                    <></>
              )}
              leftOpenValue={0}
              rightOpenValue={-75}
              previewRowKey={'0'}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              // renderItem={({ item }) => {
              //   return (
              //     <CometChatConversationListItem
              //       theme={this.theme}
              //       config={this.props.config}
              //       conversation={item}
              //       selectedConversation={this.state.selectedConversation}
              //       loggedInUser={this.loggedInUser}
              //       handleClick={this.handleClick}
              //       item={this.props.item}
              //       primaryColor={this.primaryColor}
              //     />
              //   );
              // }}
              renderItem={({ item }) => this.renderFilteredList(item)}
              ListEmptyComponent={this.listEmptyContainer}
              onScroll={this.handleScroll}
              onEndReached={this.endReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              scrollEnabled
            />
          </KeyboardAvoidingView>
          <DropDownAlert ref={(ref) => (this.dropDownAlertRef = ref)} />
        </SafeAreaView>
      </CometChatContextProvider >

    );
  }
}

const mapStateToProps = (state) => {
  return {
    messageCount: state.cometChatInfo
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    increaseMessageCount: (parameter) => {
      dispatch(setCometChatInfo(parameter))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CometChatConversationList);

// export default CometChatConversationList;
