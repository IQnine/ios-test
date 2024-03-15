/* eslint-disable react/jsx-fragments */
/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Pressable,
  BackHandler
} from 'react-native';
import {
  CometChatContextProvider,
  CometChatContext,
} from '../../../utils/CometChatContext';
import Icon from 'react-native-vector-icons/Ionicons';

import { CometChatManager } from '../../../utils/controller';

import { UserListManager } from './controller';
import CometChatUserListItem from '../CometChatUserListItem';
import style from './styles';
import theme from '../../../resources/theme';
import { logger } from '../../../utils/common';
import * as enums from '../../../utils/enums';
import { CometChat } from '@cometchat-pro/react-native-chat';
import DropDownAlert from '../../Shared/DropDownAlert';
import { COMETCHAT_CONSTANTS } from '../../../../../../CONSTS';
import { Colors } from '../../../../../../common/Colors';
import { Icons } from '../../../../../../assets/Images';
import { Utils } from '../../../../../../common/Utils';
import FastImage from 'react-native-fast-image';
import * as _AUTH_SERVICES from '../../../../../../services/auth/AuthServices';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { StackActions } from '@react-navigation/native';
class CometChatUserList extends React.PureComponent {
  static contextType = CometChatContext;

  timeout;

  friendsOnly = false;
  primaryColor = ''
  decoratorMessage = 'Loading...';

  constructor(props) {
    super(props);

    this.state = {
      userList: [],
      blockedUserList: [],
      selectedUser: null,
      textInputValue: '',
      textInputFocused: false,
      showSmallHeader: false,
      restrictions: null,
      searchBar: false
    };
    this.userListRef = React.createRef();
    this.textInputRef = React.createRef(null);
    this.theme = { ...theme, ...this.props.theme };
    this.currentLetter = '';
    this.UserListManager = new UserListManager()
  }

  componentDidMount() {
    this.getPrimaryColor();
    this.checkRestrictions();
    try {
      if (Object.prototype.hasOwnProperty.call(this.props, 'friendsOnly')) {
        this.friendsOnly = this.props.friendsOnly;
      }
      this.navListener = this.props.navigation.addListener('focus', () => {
        this.decoratorMessage = 'Loading...';
        if (this.UserListManager) {
          this.UserListManager?.removeListeners();
        }
        this.setState({ userList: [] });
        this.UserListManager = new UserListManager();
        this.UserListManager.initializeUsersRequest()
          .then((response) => {
            // this.getUsers();
            this.fetchBlockedUsers();
            this.UserListManager.attachListeners(this.userUpdated);
          })
          .catch((error) => {
            logger(error);
          });
      });
    } catch (error) {
      logger(error);
    }
  }

  checkRestrictions = async () => {
    let context = this.contextProviderRef.state;
    let isUserSearchEnabled = await context.FeatureRestriction.isUserSearchEnabled();
    this.setState({ restrictions: { isUserSearchEnabled } });
  };

  componentDidUpdate(prevProps) {
    try {
      if (this.state.textInputFocused) {
        this.textInputRef.current.focus();
      }
      const previousItem = JSON.stringify(prevProps.item);
      const currentItem = JSON.stringify(this.props.item);

      if (previousItem !== currentItem) {
        if (Object.keys(this.props.item).length === 0) {
          this.userListRef.scrollTop = 0;
          this.setState({ selectedUser: {} });
        } else {
          const userList = [...this.state.userList];

          // search for user
          const userKey = userList.findIndex(
            (u) => u.uid === this.props.item.uid,
          );
          if (userKey > -1) {
            const userObj = { ...userList[userKey] };
            this.setState({ selectedUser: userObj });
          }
        }
      }

      // if user is blocked/unblocked, update userList in state
      if (
        prevProps.item &&
        Object.keys(prevProps.item).length &&
        prevProps.item.uid === this.props.item.uid &&
        prevProps.item.blockedByMe !== this.props.item.blockedByMe
      ) {
        const userList = [...this.state.userList];

        // search for user
        const userKey = userList.findIndex(
          (u) => u.uid === this.props.item.uid,
        );
        if (userKey > -1) {
          const userObj = { ...userList[userKey] };
          const newUserObj = {
            ...userObj,
            blockedByMe: this.props.item.blockedByMe,
          };
          userList.splice(userKey, 1, newUserObj);

          this.setState({ userList });
        }
      }
    } catch (error) {
      logger(error);
    }
  }

  componentWillUnmount() {
    try {
      this.UserListManager?.removeListeners();
      this.UserListManager = null;
    } catch (error) {
      logger(error);
    }
  }

  /**
   * Handle user updated from listener
   * @param user: user object
   */
  userUpdated = (user) => {
    try {
      const userList = [...this.state.userList];

      // search for user
      const userKey = userList.findIndex((u) => u.uid === user.uid);

      // if found in the list, update user object
      if (userKey > -1) {
        const userObj = { ...userList[userKey] };
        const newUserObj = { ...userObj, ...user };
        userList.splice(userKey, 1, newUserObj);

        this.setState({ userList });
      }
    } catch (error) {
      logger(error);
    }
  };

  /**
   * Handle on end reached of the list
   * @param
   */
  endReached = () => {
    this.fetchBlockedUsers();
    // this.getUsers();
  };

  /**
   * Handle click on the list item
   * @param
   */
  handleClick = (user) => {
    if (!this.props.onItemClick) return;
    this.props.onItemClick(user, CometChat.RECEIVER_TYPE.USER);
  };

  /**
   * Retrieve user from user list while searching
   * @param
   */
  searchUsers = (val) => {
    this.setState(
      { textInputValue: val },

      () => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
          this.UserListManager = new UserListManager(val);
          this.setState({ userList: [] }, () => this.getUsers());
        }, 500);
      },
    );
  };

  getPrimaryColor = async () => {
    this.primaryColor = await Utils.getData('primaryColor');
  }

  fetchBlockedUsers = async () => {
    // this.primaryColor = await Utils.getData('primaryColor')
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          apikey: COMETCHAT_CONSTANTS.API_KEY
        }
      };

      CometChat.getLoggedinUser().then(
        (user) => {
          fetch(`https://${COMETCHAT_CONSTANTS.APP_ID}.api-us.cometchat.io/v3/users/${user.uid}/blockedusers`, options)
            .then(response => response.json())
            .then(response => {
              if (response?.data?.length < 0) {
                this.decoratorMessage = 'No users found';
              } else {
                this.setState({ blockedUserList: response?.data })
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

  /**
   * Retrieve user list from sdk acc to logged in user
   * @param
   */
  getUsers = async () => {

    try {
      new CometChatManager()
        .getLoggedInUser()
        .then((user) => {
          this.UserListManager.fetchNextUsers()
            .then((userList) => {
              if (userList.length === 0) {
                this.decoratorMessage = 'No users found';
              }
              this.setState({ userList: [...this.state.userList, ...userList] });
            })
            .catch((error) => {
              const errorCode = error?.message || 'ERROR';
              this.dropDownAlertRef?.showMessage('error', errorCode);
              this.decoratorMessage = 'Error';
              logger('[CometChatUserList] getUsers fetchNext error', error);
            });
        })
        .catch((error) => {
          const errorCode = error?.message || 'ERROR';
          this.dropDownAlertRef?.showMessage('error', errorCode);
          this.decoratorMessage = 'Error';
          logger('[CometChatUserList] getUsers getLoggedInUser error', error);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  /**
   * Component for flatList item
   * @param
   * if item - sticky header
   * @returns Component with ContactAlphabet
   * if item - user
   * @returns UserListComponent
   */
  renderUserView = ({ item, index }) => {
    if (item.header) {
      const headerLetter = item.value;
      return (
        <View style={style.contactAlphabetStyle} key={index}>
          <Text style={style.contactAlphabetTextStyle}>{_AUTH_SERVICES.decrypt(headerLetter)}</Text>
        </View>
      );
    }

    const user = item.value;
    return (
      <CometChatUserListItem
        theme={this.theme}
        user={user}
        selectedUser={this.state.selectedUser}
        clickHandler={this.handleClick}
      />
    );
  };

  /**
   * Return component for empty user list
   * @param
   */
  listEmptyContainer = () => {
    return (
      <View style={style.contactMsgStyle}>
        <Text
          style={[
            style.contactMsgTxtStyle,
            {
              color: `${this.theme.color.secondary}`
            },
          ]}>
          {this.decoratorMessage}
        </Text>
      </View>
    );
  };

  /**
   * Return separator component
   * @param
   */
  itemSeparatorComponent = ({ leadingItem }) => {
    if (leadingItem.header) {
      return null;
    }
    return (
      <View
        style={[
          style.itemSeparatorStyle,
          {
            borderBottomColor: this.theme.borderColor.primary,
          },
        ]}
      />
    );
  };

  /**
   * Return header component with text input for search
   * @param
   */
  listHeaderComponent = () => {
    return (
      <View style={[style.contactHeaderStyle]}>
        {this.state.restrictions?.isUserSearchEnabled ? (
          <View className='px-5'>
            <TouchableWithoutFeedback
              onPress={() => this.textInputRef.current.focus()}>
              <View
                style={[
                  style.contactSearchStyle,
                  {
                    backgroundColor: Colors.white,
                  },
                ]}>
                <Icon name="search" size={18} color={this.theme.color.helpText} style={{ marginLeft: 4 }} />
                <TextInput
                  ref={this.textInputRef}
                  autoCompleteType="off"
                  value={this.state.textInputValue}
                  placeholder="Search"
                  placeholderTextColor={Colors.blackColor50}
                  onChangeText={this.searchUsers}
                  onFocus={() => {
                    this.setState({ textInputFocused: true });
                  }}
                  onBlur={() => {
                    this.setState({ textInputFocused: false });
                  }}
                  clearButtonMode="always"
                  numberOfLines={1}
                  style={[
                    style.contactSearchInputStyle,
                    {
                      color: `${this.theme.color.primary}`,
                    },
                  ]}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        ) : null}
      </View>
    );
  };

  /**
   * Check scroll value to enable small headers
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

  render() {
    const userList = [...this.state.userList];
    const blockList = [...this.state.blockedUserList]
    const userListWithHeaders = [];
    let headerIndices = [0];
    if (blockList.length) {
      headerIndices = [];
      blockList.forEach((user) => {
        const chr = user.name[0].toUpperCase();
        if (chr !== this.currentLetter) {
          this.currentLetter = chr;
          if (!this.state.textInputValue) {
            headerIndices.push(userListWithHeaders.length);
            userListWithHeaders.push({
              value: this.currentLetter,
              header: true,
            });
          }
          userListWithHeaders.push({ value: user, header: false });
        } else {
          userListWithHeaders.push({ value: user, header: false });
        }
      });
    } else {
      this.decoratorMessage = 'No users found';
    }

    return (
      <CometChatContextProvider ref={(el) => (this.contextProviderRef = el)}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={style.contactWrapperStyle}>
            <View className='flex flex-row items-center py-5 px-4 w-full justify-between' style={{ backgroundColor: this.primaryColor }}>
              <View className='w-[80%] flex flex-row items-center'>
                <TouchableOpacity onPress={() => { this.props.navigation.goBack() }} className='w-[30px] h-[42px] flex justify-center'>
                  <FastImage source={Icons.IcBackBtn} className='w-[22px] h-[42px]' tintColor={Colors.white} />
                </TouchableOpacity>
                <Text className='text-whiteColor text-[20px] font-Helvetica'>Blocked conversations</Text>
              </View>
              <View>
                <Pressable onPress={() => { this.setState({ searchBar: !this.state.searchBar }) }}>
                  <Fontisto name='search' size={25} color={Colors.white} />
                </Pressable>
              </View>
            </View>
            {this.state.searchBar ? this.listHeaderComponent() : null}
            <View style={style.headerContainer}></View>
            <FlatList
              data={userListWithHeaders}
              renderItem={this.renderUserView}
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={this.listEmptyContainer}
              ItemSeparatorComponent={this.itemSeparatorComponent}
              keyExtractor={(item, index) => item.uid + '_' + index}
              stickyHeaderIndices={
                Platform.OS === 'android' ? null : headerIndices
              }
              onScroll={this.handleScroll}
              onEndReached={this.endReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}

            />
            <DropDownAlert ref={(ref) => (this.dropDownAlertRef = ref)} />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </CometChatContextProvider>
    );
  }
}

export default CometChatUserList;
