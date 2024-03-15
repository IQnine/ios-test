/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import {
  View,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  BackHandler,
  ToastAndroid,
  StyleSheet,
  Text, TouchableOpacity
} from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';
import * as actions from '../../../utils/actions';
import _ from 'lodash';
import {
  CometChatContextProvider,
  CometChatContext,
} from '../../../utils/CometChatContext';
import CometChatUserDetails from '../../Users/CometChatUserDetails';
import CometChatLiveReactions from '../CometChatLiveReactions';
import CometChatMessageHeader from '../CometChatMessageHeader';
import CometChatMessageList from '../CometChatMessageList';
import CometChatMessageComposer from '../CometChatMessageComposer';
import CometChatMessageActions from '../CometChatMessageActions';
import CometChatMessageThread from '../CometChatMessageThread';
import CometChatImageViewer from '../CometChatImageViewer';
import {
  CometChatIncomingCall,
  CometChatOutgoingCall,
  CometChatOutgoingDirectCall,
  CometChatIncomingDirectCall,
} from '../../Calls';
import CometChatGroupDetails from '../../Groups/CometChatGroupDetails';
import CometChatVideoViewer from '../CometChatVideoViewer';
import theme from '../../../resources/theme';
import { CometChatManager } from '../../../utils/controller';
import * as enums from '../../../utils/enums';
import { checkMessageForExtensionsData, logger } from '../../../utils/common';
import DropDownAlert from '../../Shared/DropDownAlert';
// import BottomSheet from 'reanimated-bottom-sheet';
import BottomSheet from '@gorhom/bottom-sheet';
import style from './styles';
import CometChatUserProfile from '../../Users/CometChatUserProfile';
import * as AuthServices from '../../../../../../services/auth/AuthServices';
import { Utils } from '../../../../../../common/Utils';
import { CometChatSharedMedia } from '../../Shared';
import { StackActions } from '@react-navigation/native';
import { Dropdown, MultiSelect, IMultiSelectRef } from 'react-native-element-dropdown';
import { SUPER_ADMIN_ID } from '../../../../../../CONSTS';
import * as CometChatServices from '../../../../../../services/ambassador/conversation/CometchatServices';
import * as AmbassadorServices from '../../../../../../services/prospect/ambassadors/AmbassadorsServices';
import { Colors } from '../../../../../../common/Colors';
import * as InstituteServices from '../../../../../../services/prospect/institutes/InstituteServices';
import Modal from "react-native-modal";
import { Icons } from '../../../../../../assets/Images';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../../../../../common/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';

class CometChatMessages extends React.PureComponent {
  static contextType = CometChatContext;
  backHandler = null
  loggedInUser = null;
  primaryColor = ''
  cometchat_feedback_uid = '';
  user_details = ''
  INTEREST_LEVEL = [
    { label: 'High', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Low', value: 3 },
  ];

  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    const { route } = props;
    const params = route?.params || props;
    this.state = {
      messageList: [],
      scrollToBottom: true,
      messageToBeEdited: '',
      replyPreview: null,
      tab: 'conversations',
      item: params.item,
      liveReaction: false,
      messageToReact: null,
      threadMessageView: false,
      threadMessageType: null,
      threadMessageItem: {},
      threadMessageParent: {},
      userDetailVisible: false,
      groupDetailVisible: false,
      user: params.type === 'user' ? params.item : null,
      showProfile: false,
      ongoingDirectCall: false,
      imageView: null,
      joinDirectCall: false,
      outgoingCall: null,
      incomingCall: null,
      ongoingDirectCall: null,
      areaOfQueryData: [],
      selected: [],
      value: 0,
      collegeData2: [],
      modalVisible: false,
      inquiryLabel: []
    };

    this.composerRef = React.createRef();
    this.sheetRef = React.createRef(null); /// //ref here
    this.bottomSheetRef = React.useRef < BottomSheet > (null);
    this.reactionName = props.reaction || 'heart';
    this.theme = { ...theme, ...params.theme };
  }

  backAction = () => {
    try {
      if (this.user_details.role_id == 5) {
        const popAction = this.props.route.params.navigation_type === 'AMBASSADOR' || this.props.route.params.navigation_type === 'TECH_SUPPORT' || this.props.route.params.navigation_type === 'ADMIN_CHAT' ? StackActions.pop(2) : StackActions.pop(1);
        this.props.navigation.dispatch(popAction);
        return true;
      } else {
        console.log("-------->", this.props.route.params.item.uid + "====" + SUPER_ADMIN_ID.staging)
        if (this.props.route.params.item.uid === SUPER_ADMIN_ID.staging || this.props.route.params.item.uid === this.cometchat_feedback_uid) {
          const action = StackActions.pop(1);
          this.props.navigation.dispatch(action)
          return true;
        } else {
          if (this.state.selected.length <= 0 || this.state.value == 0) {
            this.SetModalVisible();
          } else {
            const action = StackActions.pop(1);
            this.props.navigation.dispatch(action)
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  componentDidMount() {
    this.checkRestrictions();
    new CometChatManager()
      .getLoggedInUser()
      .then((user) => {
        this.loggedInUser = user;
      })
      .catch(() => {
        logger('[CometChatMessages] getLoggedInUser error', error);
      });

    this.getColor();
    this.getAreaOfQuery();
    this.getCollegeById();
    this.getUserInfo();
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  // componentWillMount() {
  // }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    try {
      if (this.user_details.role_id == 5) {
        const popAction = this.props.route.params.navigation_type === 'AMBASSADOR' || this.props.route.params.navigation_type === 'TECH_SUPPORT' || this.props.route.params.navigation_type === 'ADMIN_CHAT' ? StackActions.pop(2) : StackActions.pop(1);
        this.props.navigation.dispatch(popAction);
        return true;
      } else {
        if (this.props.route.params.item.uid === SUPER_ADMIN_ID.staging || this.props.route.params.item.uid === this.cometchat_feedback_uid) {
          const action = StackActions.pop(2);
          this.props.navigation.dispatch(action)
          return true;
        }else{
          if (this.state.selected.length <= 0 || this.state.value == 0) {
            this.SetModalVisible();
          } else {
            const action = StackActions.pop(1);
            this.props.navigation.dispatch(action);
            return true;
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }


  checkRestrictions = async () => {
    let context = this.contextProviderRef.state;
    let isGroupActionMessagesEnabled =
      await context.FeatureRestriction.isGroupActionMessagesEnabled();
    let isCallActionMessagesEnabled =
      await context.FeatureRestriction.isCallActionMessagesEnabled();
    let isOneOnOneChatEnabled =
      await context.FeatureRestriction.isOneOnOneChatEnabled();
    let isGroupChatEnabled =
      await context.FeatureRestriction.isGroupChatEnabled();
    let isHideDeletedMessagesEnabled =
      await context.FeatureRestriction.isHideDeletedMessagesEnabled();
    this.setState({
      restrictions: {
        isGroupActionMessagesEnabled,
        isCallActionMessagesEnabled,
        isOneOnOneChatEnabled,
        isGroupChatEnabled,
        isHideDeletedMessagesEnabled,
      },
    });
  };


  componentDidUpdate(prevProps, prevState) {
    this.getColor();
    const { route: prevRoute } = prevProps;
    const { route } = this.props;
    const params = route?.params || this.props;
    const prevParams = prevRoute?.params || prevProps;
    if (!prevState.threadMessageView && this.state.threadMessageView) {
      this.sheetRef?.current?.snapTo(0);
    }
    if (params.type === 'user' && prevParams.item.uid !== params.item.uid) {
      this.setState({
        messageList: [],
        scrollToBottom: true,
        messageToBeEdited: '',
      });
      // this.setUserDetails()
    } else if (
      params.type === 'group' &&
      prevParams.item.guid !== params.item.guid
    ) {
      this.setState({
        messageList: [],
        scrollToBottom: true,
        messageToBeEdited: '',
      });
    } else if (prevParams.type !== params.type) {
      this.setState({
        messageList: [],
        scrollToBottom: true,
        messageToBeEdited: '',
      });
    } else if (
      prevState.composedThreadMessage !== this.state.composedThreadMessage
    ) {
      this.updateReplyCount(this.state.composedThreadMessage);
    } else if (prevParams.callMessage !== params.callMessage) {
      if (prevParams.callMessage.id !== params.callMessage.id) {
        this.actionHandler('callUpdated', params.callMessage);
      }
    }
  }

  getUserInfo = async () => {
    try {
      let roleId = await Utils.getData('user_details');
      let response = roleId.role_id == 4 ? await CometChatServices.get_user_info(this.props.route.params.item.uid) : [];
      if (response?.statusCode == 200) {
        this.setState({ selected: response?.data?.area_of_query_id === null ? [] : response?.data?.area_of_query_id, value: response?.data?.enrollment_chance_id })
      }
    } catch (error) {
      console.log(error);
    }
  }


  getCollegeById = async () => {
    let collegeId = await Utils.getData('ambassador_college_id');
    let c = await Utils.getData('collegeId')
    let user = await Utils.getData('user_details');
    let response = await InstituteServices.get_colleges_by_id(user?.role_id == 4 ? collegeId : c);
    if (response.statusCode == 200) {
      this.setState({ collegeData2: response.data[0] })
    }
  }

  getAreaOfQuery = async () => {
    let option = [];
    try {
      await AmbassadorServices.get_area_of_query_list().then((res) => {
        if (res.statusCode == 200) {
          res.data?.map((o) => {
            let item = {
              label: o.area_of_query.name,
              value: o.area_of_query.id
            }
            option.push(item)
          })
          this.setState({ areaOfQueryData: option })
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  addTopiOfInquery = async (inquiryId, enroll_chance) => {
    let selected_data = {
      areaOfQuery: inquiryId,
      cometchatUID: this.props.route.params.item.uid,
      enrollChance: enroll_chance === undefined ? this.state.value : enroll_chance
    }
    try {
      let response = await CometChatServices.add_topic_of_inquiry(selected_data);
      if (response.statusCode == 200) {
        this.setState({ isFocus1: false, isFocus: false })
      }
    } catch (error) {
      console.log(error);
    }
  }

  getColor = async () => {
    this.primaryColor = await Utils.getData('primaryColor');
    this.cometchat_feedback_uid = await Utils.getData('cometchat_feedback_uid');
    this.user_details = await Utils.getData('user_details');
  }

  deleteGroup = (group) => {
    this.setState(
      {
        groupDetailVisible: false,
        groupToDelete: group,
        item: {},
        type: 'group',
        viewDetailScreen: false,
      },
      () => {
        this.props.route?.params?.actionGenerated('groupDeleted', group) ||
          (this.props.actionGenerated &&
            this.props.actionGenerated('groupDeleted', group));
        this.props.navigation?.goBack();
      },
    );
  };

  leaveGroup = (group) => {
    this.setState(
      {
        groupDetailVisible: false,
        groupToLeave: group,
        item: {},
        type: 'group',
        viewDetailScreen: false,
      },
      () => {
        this.props.navigation?.goBack();
      },
    );
  };

  updateMembersCount = (item, count) => {
    const { route } = this.props;
    const params = route?.params || this.props;

    const group = { ...this.state.item, membersCount: count };
    this.setState({ item: group, groupToUpdate: group });
    params.actionGenerated('membersUpdated', item, count);
  };

  actionHandler = (action, messages, key, group, options) => {
    try {
      const { route } = this.props;
      const params = route?.params || this.props;
      switch (action) {
        case actions.CUSTOM_MESSAGE_RECEIVED:
        case actions.MESSAGE_RECEIVED:
          {
            const message = messages[0];
            if (message.parentMessageId) {
              this.updateReplyCount(messages);
            } else {
              this.smartReplyPreview(messages);
              this.appendMessage(messages);
            }
          }
          break;
        case actions.GROUP_DELETED:
          this.deleteGroup(messages);
          break;
        case actions.LEFT_GROUP:
          this.leaveGroup(messages);
          break;
        case actions.MEMBERS_UPDATED:
          this.updateMembersCount(messages, key);
          break;
        case actions.MESSAGE_READ:
          params.actionGenerated(action, messages);
          break;
        case actions.MESSAGE_SENT:
          this.cometChatEmailNotification(messages);
        case actions.ERROR_IN_SEND_MESSAGE:
          this.messageSent(messages);
        case actions.MESSAGE_COMPOSED: {
          this.appendMessage(messages);
          break;
        }
        case actions.VIEW_MESSAGE_THREAD:
          this.setState({ messageToReact: null }, () => {
            this.viewMessageThread(messages);
            route.params.actionGenerated('viewMessageThread', messages);
          });
          break;
        case actions.CLOSE_THREAD_CLICKED:
          this.closeThreadMessages();
          break;
        case actions.MESSAGE_UPDATED: {
          this.updateMessages(messages);
          break;
        }
        case actions.MESSAGE_FETCHED:
          this.prependMessages(messages);
          break;
        case actions.MESSAGE_FETCHED_AGAIN:
          this.prependMessagesAndScrollBottom(messages);
          break;
        case actions.MESSAGE_DELETED:
          this.removeMessages(messages);
          break;
        case actions.THREAD_MESSAGE_DELETED:
          params.actionGenerated(actions.MESSAGE_DELETED, messages);
          break;
        case actions.DELETE_MESSAGE:
          this.setState({ messageToReact: null });
          this.deleteMessage(messages);
          break;
        case actions.EDIT_MESSAGE:
          this.setState({ messageToReact: null });
          this.editMessage(messages);
          break;
        case actions.MESSAGE_EDITED:
          this.messageEdited(messages);
          break;
        case actions.CLEAR_EDIT_PREVIEW:
          this.clearEditPreview();
          break;
        case actions.GROUP_UPDATED:
          this.groupUpdated(messages, key, group, options);
          break;
        case actions.CALL_UPDATED:
          this.callUpdated(messages);
          break;
        case actions.POLL_ANSWERED:
          this.updatePollMessage(messages);
          break;
        case actions.POLL_CREATED:
          this.appendPollMessage(messages);
          break;
        case actions.VIEW_ACTUAL_IMAGE:
          this.setState({ imageView: messages });
          break;
        case actions.VIEW_ACTUAL_VIDEO:
          this.setState({ videoMessage: messages });
          break;
        case actions.AUDIO_CALL:
        case actions.VIDEO_CALL:
          if (params.type === CometChat.RECEIVER_TYPE.GROUP) {
            this.setState({ joinDirectCall: false, ongoingDirectCall: true });
          } else {
            params.actionGenerated(action, { ...params.item, type: params.type });
          }
          break;
        case actions.MENU_CLICKED:
          // case actions.JOIN_DIRECT_CALL:
          params.actionGenerated(action);
          break;
        case actions.SEND_REACTION:
          this.toggleReaction(true);
          break;
        case actions.SHOW_REACTION:
          this.showReaction(messages);
          break;
        case actions.STOP_REACTION:
          this.toggleReaction(false);
          break;
        case actions.REACT_TO_MESSAGE:
          this.reactToMessage(messages);
          break;
        case actions.GO_BACK:
          this.props.navigation?.goBack();
          break;
        case actions.CLOSE_DETAIL:
          this.setState({ userDetailVisible: false, groupDetailVisible: false });
          break;
        case actions.VIEW_DETAIL:
          if (params.type === CometChat.RECEIVER_TYPE.USER) {
            this.setState({ userDetailVisible: true });
          } else {
            this.setState({ groupDetailVisible: true });
          }
          break;
        case actions.BLOCK_USER:
          this.blockUser();
          break;
        case actions.UNBLOCK_USER:
          this.unblockUser();
          break;
        case actions.CLOSE_MESSAGE_ACTIONS:
          this.setState({ messageToReact: null });
          break;
        case actions.OPEN_MESSAGE_ACTIONS:
          this.setState({ messageToReact: messages });
          break;
        case actions.UPDATE_THREAD_MESSAGE:
          this.updateThreadMessage(messages[0], key);
          break;
        case actions.THREAD_MESSAGE_COMPOSED:
          this.onThreadMessageComposed(messages);
          params.actionGenerated(actions.THREAD_MESSAGE_COMPOSED, messages);
          // this.updateLastMessage(item[0]);
          break;
        case actions.MEMBER_SCOPE_CHANGED:
          this.memberScopeChanged(messages);
          break;
        case actions.MEMBERS_REMOVED:
          this.membersRemoved(messages);
          break;
        case actions.MEMBERS_ADDED:
          this.membersAdded(messages);
          break;
        case actions.MEMBER_BANNED:
          this.memberBanned(messages);
          break;
        case actions.MEMBER_UNBANNED:
          this.memberUnbanned(messages);
          break;
        case actions.SEND_MESSAGE:
          this.setState({ messageToReact: null });
          this.sendMessage(messages);
          break;
        case actions.SHOW_PROFILE:
          this.showProfile();
          break;
        case actions.ACCEPT_INCOMING_CALL:
          this.setState({ incomingCall: messages });
          this.appendMessage([messages])
          break;
        case actions.CALL_ENDED:
        case actions.OUTGOING_CALL_REJECTED:
        case actions.OUTGOING_CALL_CANCELLED:
          params.actionGenerated(action, messages);
          break;
        case actions.REJECTED_INCOMING_CALL:
          params.actionGenerated(action, messages, key);
          break;
        case actions.ACCEPT_DIRECT_CALL:
          this.setState({ joinDirectCall: true }, () => {
            if (params.type === CometChat.RECEIVER_TYPE.GROUP)
              this.setState({ ongoingDirectCall: true })
          })
          break;
        case actions.JOIN_DIRECT_CALL:
          this.setState({ joinDirectCall: true }, () => {
            this.setState({ ongoingDirectCall: true });
          });
          break;
        case actions.DIRECT_CALL_ENDED:
          this.setState({ joinDirectCall: false, ongoingDirectCall: null });

          break;
        case enums.TRANSIENT_MESSAGE_RECEIVED:
          this.liveReactionReceived(messages);
          break;
        case actions.STATUS_UPDATED:
          this.setState({ user: { ...this.state.user, status: messages } });

          break;
        default:
          break;
      }
    } catch (e) {
      console.log(e)
    }
  };

  cometChatEmailNotification = async (message) => {
    let user_id = await Utils.getData('prospect_userId')
    let propspect_uid = await Utils.getData('prospect_cometchat_uid');
    let ambassador_uid = await Utils.getData('ambassador_cometchat_uid');
    let send_data = {
      sender_uid: message.sender.uid,
      receiver_uid: message.receiver.uid,
      userId: user_id
    }
    let d = {
      prospect_uid: propspect_uid === message.sender.uid ? message.sender.uid : message.receiver.uid,
      ambassador_uid: ambassador_uid === message.sender.uid ? message.sender.uid : message.receiver.uid,
      userId: user_id
    }
    try {
      let notification = await AuthServices.comet_chat_email_notification(send_data);
      let last_message = await AuthServices.update_last_message(d);
    } catch (error) {

    }
  }

  sendMessage = (message) => {
    const { route } = this.props;
    const params = route?.params || this.props;
    this.props.navigation.push(enums.NAVIGATION_CONSTANTS.COMET_CHAT_MESSAGES, {
      theme: params.theme,
      item: { ...message.sender },
      type: CometChat.RECEIVER_TYPE.USER,
      loggedInUser: params.loggedInUser,
      actionGenerated: params.actionGenerated,
    });
  };

  showProfile = () => {
    this.setState({
      userDetailVisible: false,
      groupDetailVisible: false,
      showProfile: true,
    });
  };

  messageSent = (message) => {
    const messageList = [...this.state.messageList];

    let messageKey = messageList.findIndex((m) => m._id === message._id);
    if (messageKey > -1) {
      const newMessageObj = { ...message };

      messageList.splice(messageKey, 1, newMessageObj);

      messageList.sort((a, b) => a.id - b.id);
      this.setState({ messageList: [...messageList] });
    }
  };

  memberUnbanned = (members) => {
    if (!this.state.restrictions?.isGroupActionMessagesEnabled) {
      return false;
    }
    const messageList = [...this.state.messageList];
    let filteredMembers = _.uniqBy(members, 'id');
    filteredMembers.forEach((eachMember) => {
      const message = `${this.loggedInUser.name} unbanned ${eachMember.name}`;
      const sentAt = (new Date() / 1000) | 0;
      const messageObj = {
        category: 'action',
        message: message,
        type: enums.ACTION_TYPE_GROUPMEMBER,
        sentAt: sentAt,
      };
      messageList.push(messageObj);
    });

    this.setState({ messageList: messageList });
  };

  liveReactionReceived = (reaction) => {
    try {
      const stopReaction = () => {
        this.toggleReaction(false);
      };

      if (reaction.data.type === enums['METADATA_TYPE_LIVEREACTION']) {
        const params = this.props?.route?.params || this.props;

        if (
          (params.type === CometChat.RECEIVER_TYPE.GROUP &&
            reaction.getReceiverId() === params.item.guid) ||
          (params.type === CometChat.RECEIVER_TYPE.USER &&
            reaction.getSender()?.uid === params.item.uid)
        ) {
          this.reactionName = reaction.data.reaction;
          this.toggleReaction(true);

          const liveReactionInterval = 1000;
          setTimeout(stopReaction, liveReactionInterval);
        }
      }
    } catch (error) {
      logger(error);
    }
  };

  membersAdded = (members) => {
    if (!this.state.restrictions?.isGroupActionMessagesEnabled) {
      return false;
    }
    const messageList = [...this.state.messageList];
    members.forEach((eachMember) => {
      const message = `${this.loggedInUser.name} added ${eachMember.name}`;
      const sentAt = (new Date() / 1000) | 0;
      const messageObj = {
        category: 'action',
        message,
        type: enums.ACTION_TYPE_GROUPMEMBER,
        sentAt,
      };
      messageList.push(messageObj);
    });

    this.setState({ messageList: messageList });
  };

  membersRemoved = (members) => {
    if (!this.state.restrictions?.isGroupActionMessagesEnabled) {
      return false;
    }
    const messageList = [...this.state.messageList];
    let filteredMembers = _.uniqBy(members, 'id');
    filteredMembers.forEach((eachMember) => {
      const message = `${this.loggedInUser.name} kicked ${eachMember.name}`;
      const sentAt = (new Date() / 1000) | 0;
      const messageObj = {
        category: 'action',
        message: message,
        type: enums.ACTION_TYPE_GROUPMEMBER,
        sentAt: sentAt,
      };
      messageList.push(messageObj);
    });

    this.setState({ messageList: messageList });
  };

  memberScopeChanged = (members) => {
    if (!this.state.restrictions?.isGroupActionMessagesEnabled) {
      return false;
    }
    const messageList = [...this.state.messageList];
    let filteredMembers = _.uniqBy(members, 'id');
    filteredMembers.forEach((eachMember) => {
      const message = `${this.loggedInUser.name} made ${eachMember.name} ${eachMember.scope}`;
      const sentAt = (new Date() / 1000) | 0;
      const messageObj = {
        category: 'action',
        message: message,
        type: enums.ACTION_TYPE_GROUPMEMBER,
        sentAt: sentAt,
      };
      messageList.push(messageObj);
    });

    this.setState({ messageList: messageList });
  };

  memberBanned = (members) => {
    if (!this.state.restrictions?.isGroupActionMessagesEnabled) {
      return false;
    }
    const messageList = [...this.state.messageList];
    members.forEach((eachMember) => {
      const message = `${this.loggedInUser.name} banned ${eachMember.name}`;
      const sentAt = (new Date() / 1000) | 0;
      const messageObj = {
        category: 'action',
        message,
        type: enums.ACTION_TYPE_GROUPMEMBER,
        sentAt,
      };
      messageList.push(messageObj);
    });

    this.setState({ messageList: messageList });
  };

  closeThreadMessages = () => {
    this.setState({ viewDetailScreen: false, threadMessageView: false });
  };

  viewMessageThread = (parentMessage) => {
    const { route } = this.props;
    const params = route?.params || this.props;
    const message = { ...parentMessage };
    const threadItem = { ...this.state.item };
    this.setState({
      threadMessageView: true,
      threadMessageParent: message,
      threadMessageItem: threadItem,
      threadMessageType: params.type,
      viewDetailScreen: false,
    });
  };

  onThreadMessageComposed = (composedMessage) => {
    const { route } = this.props;
    const params = route?.params || this.props;

    if (params.type !== this.state.threadMessageType) {
      return false;
    }

    if (
      (this.state.threadMessageType === 'group' &&
        this.state.item.guid !== this.state.threadMessageItem.guid) ||
      (this.state.threadMessageType === 'user' &&
        this.state.item.uid !== this.state.threadMessageItem.uid)
    ) {
      return false;
    }

    const message = { ...composedMessage };
    this.setState({ composedThreadMessage: message });
  };

  blockUser = () => {
    const { route } = this.props;
    const params = route?.params || this.props;
    const usersList = [this.state.item.uid];
    CometChatManager.blockUsers(usersList)
      .then((response) => {
        this.dropDownAlertRef?.showMessage('success', 'Blocked user');
        this.setState({ user: { ...this.state.item, blockedByMe: true } });
        params.actionGenerated('blockUser');
        // ToastAndroid.showWithGravity(response.message, ToastAndroid.SHORT, ToastAndroid.CENTER);
      })
      .catch((error) => {
        const errorCode = error?.message || 'ERROR';
        this.dropDownAlertRef?.showMessage('error', errorCode);
        logger('Blocking user fails with error', error);
      });
  };

  unblockUser = () => {
    const { route } = this.props;
    const params = route?.params || this.props;
    const usersList = [this.state.item.uid];
    CometChatManager.unblockUsers(usersList)
      .then((response) => {
        this.setState({ user: { ...this.state.item, blockedByMe: false } });
        params.actionGenerated('unblockUser');
        // ToastAndroid.showWithGravity(response.message, ToastAndroid.SHORT, ToastAndroid.CENTER);
      })
      .catch((error) => {
        logger('unblocking user fails with error', error);
      });
  };

  toggleReaction = (flag) => {
    this.setState({ liveReaction: flag });
  };

  showReaction = (reaction) => {
    if (!Object.prototype.hasOwnProperty.call(reaction, 'metadata')) {
      return false;
    }

    if (reaction.metadata === undefined ||
      !Object.prototype.hasOwnProperty.call(reaction.metadata, 'type') ||
      !Object.prototype.hasOwnProperty.call(reaction.metadata, 'reaction')
    ) {
      return false;
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        enums.LIVE_REACTIONS,
        reaction.metadata.reaction,
      )
    ) {
      return false;
    }

    if (reaction.metadata.type === enums.LIVE_REACTION_KEY) {
      this.reactionName = reaction.metadata.reaction;
      this.setState({ liveReaction: true });
    }
  };

  updateThreadMessage = (message, action) => {
    if (this.state.threadMessageView === false) {
      return false;
    }

    if (action === 'delete') {
      this.setState({
        threadMessageParent: { ...message },
        threadMessageView: false,
      });
    } else {
      this.setState({ threadMessageParent: { ...message } });
    }
  };

  deleteMessage = (message) => {
    const { route } = this.props;
    const params = route?.params || this.props;
    const messageId = message.id;
    CometChat.deleteMessage(messageId)
      .then((deletedMessage) => {
        this.removeMessages([deletedMessage]);

        const messageList = [...this.state.messageList];
        const messageKey = messageList.findIndex((m) => m.id === message.id);

        this.actionHandler('updateThreadMessage', [deletedMessage], 'delete');
        params.actionGenerated(
          'updateThreadMessage',
          [deletedMessage],
          'delete',
        );

        if (messageList.length - messageKey === 1 && !message.replyCount) {
          params.actionGenerated('messageDeleted', [deletedMessage]);
        }
      })
      .catch((e) => { console.log(e); });
  };

  editMessage = (message) => {
    this.setState({ messageToBeEdited: message, replyPreview: null });
  };

  messageEdited = (message) => {
    const { route } = this.props;
    const params = route?.params || this.props;

    const messageList = [...this.state.messageList];
    const messageKey = messageList.findIndex((m) => m.id === message.id);
    if (messageKey > -1) {
      const messageObj = messageList[messageKey];

      const newMessageObj = { ...messageObj, ...message };

      messageList.splice(messageKey, 1, newMessageObj);
      this.updateMessages(messageList);

      params.actionGenerated('updateThreadMessage', [newMessageObj], 'edit');

      if (messageList.length - messageKey === 1 && !message.replyCount) {
        params.actionGenerated('messageEdited', [newMessageObj]);
      }
    }
  };

  updatePollMessage = (message) => {
    const messageList = [...this.state.messageList];
    const messageId = message.poll.id;
    const messageKey = messageList.findIndex((m) => m.id === messageId);
    if (messageKey > -1) {
      const messageObj = messageList[messageKey];

      const metadataObj = {
        '@injected': { extensions: { polls: message.poll } },
      };

      const newMessageObj = { ...messageObj, metadata: metadataObj };

      messageList.splice(messageKey, 1, newMessageObj);
      this.updateMessages(messageList);
    }
  };

  appendPollMessage = (messages) => {
    this.appendMessage(messages);
  };

  // messages are deleted
  removeMessages = (messages) => {
    const deletedMessage = messages[0];
    const messageList = [...this.state.messageList];

    const messageKey = messageList.findIndex(
      (message) => message.id === deletedMessage.id,
    );
    if (messageKey > -1) {
      const messageObj = { ...messageList[messageKey] };
      const newMessageObj = { ...messageObj, ...deletedMessage };
      if (this.state.restrictions?.isHideDeletedMessagesEnabled) {
        messageList.splice(messageKey, 1);
      } else {
        messageList.splice(messageKey, 1, newMessageObj);
      }
      this.setState({ messageList: messageList, scrollToBottom: false });
    }
  };

  // messages are fetched from backend
  prependMessages = (messages) => {
    const messageList = [...messages, ...this.state.messageList];
    const result = Object.values(
      messageList.reduce((msg, obj) => ({ ...msg, [obj.rawMessage.id]: obj }), {})
    );
    this.setState({ messageList: result, scrollToBottom: false });
  };

  prependMessagesAndScrollBottom = (messages) => {
    const messageList = [...messages, ...this.state.messageList];
    this.setState({ messageList, scrollToBottom: true });
  };

  // message is received or composed & sent
  appendMessage = (newMessages = []) => {
    if (
      this.state.messageList &&
      newMessages.length &&
      this.state.messageList.length &&
      this.state.messageList.length &&
      newMessages[newMessages.length - 1].id ===
      this.state.messageList[this.state.messageList.length - 1].id
    ) {
      return;
    }
    let messages = [...this.state.messageList];
    // messages = messages.reverse();
    messages = messages.concat(newMessages);
    messages = _.uniqBy(messages, 'id');
    this.setState({ messageList: messages, scrollToBottom: true });
  };

  // message status is updated
  updateMessages = (messages) => {
    this.setState({ messageList: messages, scrollToBottom: false });
  };

  groupUpdated = (message, key, group, options) => {
    const { route } = this.props;
    const params = route?.params || this.props;

    switch (key) {
      case enums.GROUP_MEMBER_BANNED:
      case enums.GROUP_MEMBER_KICKED: {
        if (options.user.uid === this.loggedInUser.uid) {
          this.setState({ item: {}, type: 'group', viewDetailScreen: false });
        }
        break;
      }
      case enums.GROUP_MEMBER_SCOPE_CHANGED: {
        if (options.user.uid === this.loggedInUser.uid) {
          const newObj = { ...this.state.item, scope: options.scope };
          this.setState({
            item: newObj,
            type: 'group',
            viewDetailScreen: false,
          });
        }
        break;
      }
      default:
        break;
    }

    params.actionGenerated('groupUpdated', message, key, group, options);
  };

  callUpdated = (message) => {
    const { status, callInitiator } = message
    switch (status) {
      case CometChat.CALL_STATUS.INITIATED:
        if (callInitiator.uid === this.loggedInUser.uid) {
          this.setState({ outgoingCall: message })
        }
        break;
      case CometChat.CALL_STATUS.BUSY:
      case CometChat.CALL_STATUS.CANCELLED:
      case CometChat.CALL_STATUS.ENDED:
      case CometChat.CALL_STATUS.REJECTED:
      case CometChat.CALL_STATUS.UNANSWERED:
        this.setState({ outgoingCall: null, incomingCall: null })
      default:
        break;
    }
    this.appendMessage([message]);
  };

  updateReplyCount = (messages) => {
    const receivedMessage = messages[0];

    const messageList = [...this.state.messageList];
    const messageKey = messageList.findIndex(
      (m) => m.id === receivedMessage.parentMessageId,
    );
    if (messageKey > -1) {
      const messageObj = messageList[messageKey];
      let replyCount = Object.prototype.hasOwnProperty.call(
        messageObj,
        'replyCount',
      )
        ? messageObj.replyCount
        : 0;
      replyCount += 1;
      const newMessageObj = { ...messageObj, replyCount };

      messageList.splice(messageKey, 1, newMessageObj);
      this.setState({ messageList, scrollToBottom: false });
    }
  };

  smartReplyPreview = (messages) => {
    const { route } = this.props;
    const params = route?.params || this.props;

    const message = messages[0];
    if (
      message.sender.uid === params.loggedInUser.uid ||
      message.category === CometChat.MESSAGE_TYPE.CUSTOM
    ) {
      return false;
    }

    const smartReplyData = checkMessageForExtensionsData(
      message,
      'smart-reply',
    );
    if (
      smartReplyData &&
      Object.prototype.hasOwnProperty.call(smartReplyData, 'error') === false
    ) {
      this.setState({ replyPreview: message });
    } else {
      this.setState({ replyPreview: null });
    }
  };

  clearEditPreview = () => {
    this.setState({ messageToBeEdited: '' });
  };

  reactToMessage = (message) => {
    this.setState({ messageToReact: message });
  };

  getConversationId = () => {
    const { route } = this.props;
    const params = route?.params || this.props;
    let conversationId = null;
    if (params.type === CometChat.RECEIVER_TYPE.USER) {
      const users = [this.loggedInUser.uid, params.item.cometchat_uid];
      conversationId = users.sort().join('_user_');
    } else if (params.type === CometChat.RECEIVER_TYPE.GROUP) {
      conversationId = `group_${params.item.guid}`;
    }

    return conversationId;
  };

  SetModalVisible = () => {
    this.setState({ modalVisible: true })
  }

  decrypt(name) {
    return AuthServices.decrypt(name);
  }

  go_back(property) {
    if (property.navigation_type === 'AMBASSADOR') {
      const popAction = StackActions.pop(2);
      this.props.navigation.dispatch(popAction);
      return true;
    } else {
      this.props.navigation.goBack()
    }
  }

  string_data = (myProps) => {
    let data = myProps?.map((e, i) => {
      return e.name
    })
    return String(data);
  }

  screenHeight = Dimensions.get('window').height;

  getSelectedItems = () => {
    try {
      let { areaOfQueryData, selected } = this.state
      let d = areaOfQueryData.filter(t => selected.includes(t.value))
      if (d.length) {
        return d.map(o => o.label).join(', ')
      } else {
        return "Topic of inquiry"
      }
    } catch (e) {
      console.log(e)
      return "Topic of inquiry"
    }
  }

  render() {
    const { route } = this.props;
    const params = route?.params || this.props;

    const { instituteInfo } = this.props;
    const primaryColor1 = instituteInfo.college_data[0]?.font_color;

    let imageView = null;
    if (this.state.imageView) {
      imageView = (
        <CometChatImageViewer
          open
          close={() => this.setState({ imageView: null })}
          message={this.state.imageView}
          // color={this.primaryColor}
          color={primaryColor1}
        />
      );
    }
    let messageComposer = (
      <CometChatMessageComposer
        ref={(el) => {
          this.composerRef = el;
        }}
        theme={this.theme}
        item={
          params.type === CometChat.RECEIVER_TYPE.USER
            ? this.state.user
            : this.state.item
        }
        type={params.type}
        // widgetsettings={route.params.widgetsettings}
        loggedInUser={this.loggedInUser}
        messageToBeEdited={this.state.messageToBeEdited}
        replyPreview={this.state.replyPreview}
        reaction={this.reactionName}
        messageToReact={this.state.messageToReact}
        actionGenerated={this.actionHandler}
        getConversationId={this.getConversationId}
        showMessage={(type, message) => {
          this.DropDownAlertRef?.showMessage(type, message);
        }}
        // primaryColor={this.primaryColor}
        primaryColor={primaryColor1}
      />
    );

    if (
      (params.type === CometChat.RECEIVER_TYPE.USER &&
        this.state.restrictions?.isOneOnOneChatEnabled === false) ||
      (params.type === CometChat.RECEIVER_TYPE.GROUP &&
        this.state.restrictions?.isGroupChatEnabled === false)
    ) {
      messageComposer = null;
    }

    let liveReactionView = null;
    if (this.state.liveReaction) {
      liveReactionView = (
        <View style={style.reactionsWrapperStyle}>
          <CometChatLiveReactions
            reactionName={this.reactionName}
            theme={this.theme}
            type={params.type}
            item={
              params.type === CometChat.RECEIVER_TYPE.USER
                ? this.state.user
                : this.state.item
            }
          />
        </View>
      );
    }

    const threadMessageView = (
      <Modal
        transparent
        animated
        animationType="fade"
        visible={this.state.threadMessageView}>
        <View style={{}}>
          <BottomSheet
            ref={this.bottomSheetRef}
            snapPoints={['100%', '100%']}
            borderRadius={30}
            index={1}
            enablePanDownToClose={true}
            onCloseEnd={() => {
              this.actionHandler('closeThreadClicked');
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                height: Dimensions.get('window').height - 80,
                width: '100%'
              }}>
              <CometChatMessageThread
                theme={this.theme}
                tab={this.state.tab}
                item={this.state.threadMessageItem}
                type={this.state.threadMessageType}
                parentMessage={this.state.threadMessageParent}
                loggedInUser={this.loggedInUser}
                getConversationId={this.getConversationId}
                actionGenerated={this.actionHandler}
              />
            </View>
          </BottomSheet>
        </View>
      </Modal>
    );

    return (
      <CometChatContextProvider ref={(el) => (this.contextProviderRef = el)}>
        <Modal
          isVisible={this.state.modalVisible}
          // onBackButtonPress={() => { this.setState({ modalVisible: false }) }}
          // onBackdropPress={() => { this.setState({ modalVisible: false }) }}
          coverScreen={true}
          style={{
            margin: 0,
            flex: 1,
            justifyContent: 'flex-start'
          }}
        >
          <View className='h-full w-full bg-transparent relative flex items-center  justify-center'>
            <View className='w-[330px] h-[305px] rounded-[6px]'>
              <View className=' w-full rounded-t-[5px]' style={{ backgroundColor: primaryColor1 }}>
                <View className='px-5 py-5 rounded-t-[3px] rounded-b-[6px] bg-whiteColor mt-[6px]'>
                  <View className='py-5 w-full'>
                    <Text className='text-textColor text-[16px] font-InterRegular font-normal tracking-[0.44px] leading-4 text-center'>Please select topic of inquiry/enrollment likelilhood before leaving this chat</Text>
                  </View>
                  <TouchableOpacity
                    className={`flex px-4 h-[60px] justify-center items-center rounded-[4px] mt-8`}
                    style={{ backgroundColor: primaryColor1 }}
                    onPress={() => { this.setState({ modalVisible: false }) }}>
                    <Text className='text-whiteColor text-[14px] font-normal font-InterRegular'>Ok, Got it!</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex px-4 h-[60px] justify-center items-center rounded-[4px] mt-5 bg-whiteColor border-[1px] border-greyBorder`}
                    onPress={() => { this.go_back(params) }}>
                    <Text className='text-greyBorder text-[14px] font-normal font-InterRegular'>I’m not sure yet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <SafeAreaView style={style.chatWrapperStyle}>
            {imageView}
            {this.state.showProfile ? (
              <CometChatUserProfile
                open
                close={() => this.setState({ showProfile: null })}
                url={this.state.user?.link}
              />
            ) : null}
            {this.state.videoMessage ? (
              <CometChatVideoViewer
                open
                close={() => this.setState({ videoMessage: null })}
                message={this.state.videoMessage}
                color={primaryColor1}
              />
            ) : null}
            {this.state.userDetailVisible ? (
              // <CometChatUserDetails
              //   open={this.state.userDetailVisible}
              //   theme={this.theme}
              //   item={
              //     params.type === CometChat.RECEIVER_TYPE.USER
              //       ? this.state.user
              //       : this.state.item
              //   }
              //   type={params.type}
              //   actionGenerated={this.actionHandler}
              // />
              <CometChatSharedMedia
                theme={this.theme}
                containerHeight={50}
                showMessage={(type, message) => {
                  this.dropDownAlertRef?.showMessage(type, message);
                }}
                item={this.state.item}
                user={this.state.user}
                type={params.type}
                actionGenerated={this.actionHandler}
                navigation={this.props.navigation}
                // color={this.primaryColor}
                color={primaryColor1}
              />
            ) : null}
            {threadMessageView}
            {this.state.groupDetailVisible ? (
              <CometChatGroupDetails
                theme={this.theme}
                open={this.state.groupDetailVisible}
                item={this.state.item}
                type={params.type}
                actionGenerated={this.actionHandler}
                loggedInUser={this.loggedInUser}
              />
            ) : null}
            <CometChatMessageActions
              item={
                params.type === CometChat.RECEIVER_TYPE.USER
                  ? this.state.user
                  : this.state.item
              }
              type={params.type}
              loggedInUser={this.loggedInUser}
              open={!!this.state.messageToReact}
              message={this.state.messageToReact}
              actionGenerated={this.actionHandler}
              close={() => {
                this.actionHandler('closeMessageActions');
              }}
            />
            <CometChatMessageHeader
              sidebar={params.sidebar}
              theme={this.theme}
              item={
                params.type === CometChat.RECEIVER_TYPE.USER
                  ? this.state.user
                  : this.state.item
              }
              type={params.type}
              viewdetail={params.viewdetail !== false}
              audioCall={params.audioCall !== false}
              videoCall={params.videoCall !== false}
              // widgetsettings={route.params.widgetsettings}
              loggedInUser={params.loggedInUser}
              actionGenerated={this.actionHandler}
              navigation_type={params.navigation_type}
              navigation={this.props.navigation}
              modalVisible={this.state.modalVisible}
              topicId={this.state.selected}
              interesetId={this.state.value}
              SetModalVisible={this.SetModalVisible}
            />

            {
              this.props.route.params.item.uid === SUPER_ADMIN_ID.staging || this.props.route.params.item.uid === this.cometchat_feedback_uid ?
                null
                :
                this.user_details.role_id == 4 ?
                  <>
                    <View className='w-full h-[70px] bg-whiteColor flex flex-row justify-between items-center'>
                      <View style={[styles1.container1, { width: this.state.collegeData2?.interest_level_enabled == 1 ? '47%' : '95%' }]}>
                        <MultiSelect
                          style={[styles1.dropdown, this.state.isFocus1 && { borderWidth: 1, borderColor: primaryColor1, backgroundColor: Colors.white }]}
                          placeholderStyle={styles1.placeholderStyle}
                          selectedTextStyle={styles1.selectedTextStyle}
                          itemTextStyle={{ color: Colors.grey1, fontSize: 12 }}
                          inputSearchStyle={styles1.inputSearchStyle}
                          itemContainerStyle={{ borderColor: Colors.fieldGrayColor, borderTopWidth: 1, paddingRight: 10 }}
                          containerStyle={{ borderRadius: 4, borderColor: primaryColor1, borderWidth: 1, width: 250, marginTop: 8 }}
                          iconStyle={styles1.iconStyle}
                          iconColor={Colors.greyBorder}
                          activeColor={'#0000'}
                          dropdownPosition='auto'
                          data={this.state.areaOfQueryData}
                          disable={this.props.route.params.item.blockedByMe}
                          labelField="label"
                          valueField="value"
                          alwaysRenderSelectedItem={false}
                          placeholder={this.getSelectedItems()}
                          value={this.state.selected}
                          maxHeight={this.screenHeight * 2 / 3}
                          onFocus={() => this.setState({ isFocus1: true })}
                          // onBlur={() => { this.props.route.params.item.blockedByMe == true ? null : this.addTopiOfInquery(); this.setState({ isFocus1: false }) }}
                          onChange={(item) => {
                            this.setState({ selected: item })
                            this.addTopiOfInquery(item, this.state.value)
                          }}
                          renderItem={(item) => {
                            let i = this.state.selected.findIndex(t => t == item.value)
                            return <View style={{ padding: 10, paddingRight: 20, flexDirection: 'row', alignItems: 'center', minHeight: 60 }} key={item._index}>
                              {i !== -1 ?
                                // <Ionicons name='checkbox' size={20} color={Colors.greyColor25} />
                                <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                  <View className='w-[14px] h-[14px] rounded-[2px]' style={{ backgroundColor: primaryColor1 }}></View>
                                </View>
                                :
                                // <Ionicons name='square-outline' size={20} color={Colors.greyColor50} />
                                <View className='flex justify-center items-center w-5 h-5 border-[1.5px] border-greyColor rounded-[3px]'>
                                  {/* <View className='w-[14px] h-[14px] rounded-[2px]' style={{ backgroundColor: this.primaryColor }}></View> */}
                                </View>
                              }
                              <Text style={{ color: Colors.grey1, marginLeft: 10 }} >{item.label}</Text>
                            </View>
                          }}
                          inside={false}
                          renderSelectedItem={(item) => {
                            return (
                              // <View style={{ flexDirection: 'row', alignItems: 'center',width:'100%' }}>
                              //   <Text numberOfLines={1} className='text-greyBorder text-[14px]'>{item.label}</Text>
                              // </View>
                              <></>
                            )
                          }}
                          selectedStyle={{ flexDirection: 'row', backgroundColor: Colors.errorColor }}
                          renderRightIcon={() => {
                            return (
                              <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{ paddingRight: 10 }} />
                            )
                          }}
                        />
                      </View>
                      {
                        this.state.collegeData2?.interest_level_enabled == 1 ?
                          <View style={styles1.container2}>
                            <Dropdown
                              selectedTextProps={{ numberOfLines: 1 }}
                              style={[styles1.dropdown, this.state.isFocus && { borderWidth: 1, borderColor: primaryColor1, backgroundColor: Colors.white }]}
                              placeholderStyle={styles1.placeholderStyle}
                              selectedTextStyle={styles1.selectedTextStyle}
                              inputSearchStyle={styles1.inputSearchStyle}
                              itemContainerStyle={{ borderTopWidth: 1, borderTopRadius: 4, borderColor: Colors.fieldGrayColor }}
                              containerStyle={{ borderWidth: 1, borderRadius: 4, borderColor: primaryColor1, marginTop: 8 }}
                              itemTextStyle={{ color: Colors.greyBorder, fontSize: 12 }}
                              iconStyle={styles1.iconStyle}
                              iconColor={Colors.greyBorder}
                              activeColor={primaryColor1}
                              disable={this.props.route.params.item.blockedByMe}
                              data={this.INTEREST_LEVEL}
                              maxHeight={300}
                              labelField="label"
                              valueField="value"
                              placeholder={!this.state.isFocus ? 'Enrollment likelihood' : 'Enrollment likelihood'}
                              searchPlaceholder="Search..."
                              value={this.state.value}
                              onFocus={() => this.setState({ isFocus: true })}
                              onBlur={() => { this.setState({ isFocus: false }) }}
                              onChange={item => {
                                this.setState({ value: item.value })
                                if (this.props.route.params.item.blockedByMe == false) {
                                  this.addTopiOfInquery(this.state.selected, item.value);
                                }
                              }}
                              renderRightIcon={() => {
                                return (
                                  <AntDesign name='caretdown' size={8} color={Colors.greyBorder} style={{}} />
                                )
                              }}

                              renderItem={(item) => {
                                return (
                                  <View style={{ padding: 10, paddingRight: 20, flexDirection: 'row', alignItems: 'center', minHeight: 60 }} key={item._index}>
                                    <Text style={{ color: item.value === this.state.value ? Colors.white : Colors.grey1, marginLeft: 10 }} >{item.label}</Text>
                                  </View>
                                )
                              }}
                            />
                          </View>
                          : <></>
                      }
                    </View >
                    {
                      this.state.collegeData2?.timely_response_suggestion == 1 ?
                        <View className='h-[30px] bg-greyColor25 flex flex-row items-center justify-center px-[5px' style={{ width: Dimensions.get('window').width }}>
                          <View className='flex flex-row items-center justify-center' style={{ width: Dimensions.get('window').width }}>
                            <View className='w-[12px] h-[12px]'>
                              <FastImage source={Icons.IcTimer} className='w-full h-full' resizeMode='contain' />
                            </View>
                            <Text className='text-textColor text-[11px] leading-5 font-InterRegular tracking-[0.15px] font-normal ml-1'>Please ensure timely response to prospects within 24 hours</Text>
                          </View>
                        </View>
                        : <></>
                    }
                  </>
                  : this.user_details.role_id == 5 && this.state.collegeData2?.timely_response_suggestion == 1 ?
                    <View className='h-[30px] bg-greyColor25 flex flex-row items-center justify-center px-[5px]' style={{ width: Dimensions.get('window').width }}>
                      <View className='flex flex-row items-center justify-center' style={{ width: Dimensions.get('window').width }}>
                        <View className='w-[12px] h-[12px]'>
                          <FastImage source={Icons.IcTimer} className='w-full h-full' resizeMode='contain' />
                        </View>
                        <Text className='text-textColor text-[11px] leading-5 font-InterRegular tracking-[0.15px] font-normal ml-1'>{this.decrypt(this.props.route.params.item.name)} typically responds within 24 hours</Text>
                      </View>
                    </View>
                    : null

            }

            <CometChatMessageList
              theme={this.theme}
              messages={this.state.messageList}
              item={
                params.type === CometChat.RECEIVER_TYPE.USER
                  ? this.state.user
                  : this.state.item
              }
              type={params.type}
              scrollToBottom={this.state.scrollToBottom}
              messageConfig={params.messageconfig}
              showMessage={(type, message) => {
                this.DropDownAlertRef?.showMessage(type, message);
              }}
              // widgetsettings={route.params.widgetsettings}
              // widgetconfig={route.params.widgetconfig}
              loggedInUser={params.loggedInUser}
              actionGenerated={this.actionHandler}
              getConversationId={this.getConversationId}
              navigation_type={params.navigation_type}
              message_key='SEARCH_MESSAGE'
            />
            {liveReactionView}
            {messageComposer}
          </SafeAreaView>
          <DropDownAlert ref={(ref) => (this.DropDownAlertRef = ref)} />
        </KeyboardAvoidingView>
        {this.state.ongoingDirectCall ? (
          <>
            <CometChatOutgoingDirectCall
              open
              close={() => this.actionHandler(actions.DIRECT_CALL_ENDED)}
              theme={this.theme}
              item={this.state.item}
              type={params.type}
              lang={this.state.lang}
              callType={CometChat.CALL_TYPE.VIDEO}
              joinDirectCall={this.state.joinDirectCall}
              loggedInUser={params.loggedInUser}
              actionGenerated={this.actionHandler}
            />
          </>
        ) : null}
        {this.state.restrictions?.isCallActionMessagesEnabled ? (
          <CometChatIncomingCall
            showMessage={(type, message) => {
              this.dropDownAlertRef?.showMessage(type, message);
            }}
            theme={this.theme}
            loggedInUser={this.loggedInUser}
            actionGenerated={this.actionHandler}
            outgoingCall={this.state.outgoingCall}
          />
        ) : null}
        <CometChatOutgoingCall
          theme={this.theme}
          item={this.state.item}
          type={this.state.type}
          incomingCall={this.state.incomingCall}
          outgoingCall={this.state.outgoingCall}
          loggedInUser={this.loggedInUser}
          actionGenerated={this.actionHandler}
        />
        {this.state.restrictions?.isCallActionMessagesEnabled ? (
          <CometChatIncomingDirectCall
            theme={this.props.theme}
            lang={this.state.lang}
            actionGenerated={this.actionHandler}
          />
        ) : null}
      </CometChatContextProvider>
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
    fontSize: 13,
    color: Colors.greyBorder,
    fontFamily: Fonts.InterRegular
  },
  selectedTextStyle: {
    fontSize: 14,
    color: Colors.greyBorder,
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
  selectedStyle1: {
    backgroundColor: Colors.blackColor50,
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  }
});

const mapStateToProps = state => {
  return {
    instituteInfo: state.instituteInfoReducer.instituteInfo,
  };
};

export default connect(mapStateToProps)(CometChatMessages);
