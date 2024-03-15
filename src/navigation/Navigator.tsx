import { View, Text, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootBottomParamList, RootStackParamList } from '../../type';
import { enableScreens } from 'react-native-screens';
import Signup from '../screens/auth/Signup';
import Login from '../screens/auth/Login';
import { useSelector, useDispatch } from 'react-redux';
import Ambassadors from '../screens/prospect/tabs/ambassador/Ambassadors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../common/Colors';
import FastImage from 'react-native-fast-image';
import { Icons } from '../assets/Images';
import Calendar from '../screens/ambassador/tabs/Calendar';
import Conversation from '../screens/ambassador/tabs/Conversation';
import AddAvailability from '../screens/ambassador/calendar/modals/AddAvailability';
import { CometChatConversationList, CometChatConversationListWithMessages, CometChatGroupList, CometChatGroupListWithMessages, CometChatMessages, CometChatUserList, CometChatUserListWithMessages } from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src';
import Otp from '../screens/auth/Otp';
import Institutions from '../screens/prospect/institution/Institutions';
import AddInstitute from '../screens/prospect/institution/AddInstitute';
import AmbassadorProfile from '../screens/prospect/tabs/ambassador/AmbassadorProfile';
import Menu from '../screens/prospect/menu/Menu';
import Scheduler from '../screens/prospect/tabs/scheduler/Scheduler';
import ProspectConversations from '../screens/prospect/tabs/conversation/ProspectConversations';
import { setInternetStatus } from '../redux/action/InternetAction';
import NetInfo from "@react-native-community/netinfo";
import NetworkError from '../screens/NetworkError';
import ScheduleChat from '../screens/prospect/tabs/ambassador/ScheduleChat';
import Profile from '../screens/prospect/menu/Profile';
import { Utils } from '../common/Utils';
import Notification from '../screens/prospect/menu/Notification';
import EditProfile from '../screens/prospect/menu/EditProfile';
import * as ProfileServices from '../services/prospect/profile/ProfileServices';
import { setUserInfo } from '../redux/action/UserAction';
import { CometChatSharedMedia } from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Shared';
import Splash from '../screens/auth/Splash';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { COMETCHAT_CONSTANTS } from '../CONSTS';
import { setCometChatInfo, setCometChatList } from '../redux/action/CometChatAction';
import CompleteProfile from '../screens/auth/CompleteProfile';
import AmbassadorMenu from '../screens/ambassador/menu/AmbassadorMenu';
import AmbassadorPrfoile from '../screens/ambassador/menu/AmbassadorPrfoile';
import AmbassadorEditProfile from '../screens/ambassador/menu/AmbassadorEditProfile';
import CometChatManager from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/utils/controller';
import { ConversationListManager } from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Chats/CometChatConversationList/controller';
import BlockListUsers from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Chats/CometChatConversationList/BlockListUsers';
import Notes from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Messages/CometChatMessageHeader/Notes';
import NewNotes from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Messages/CometChatMessageHeader/NewNotes';
import SharedMedia2 from '../cometchat-pro-react-native-ui-kit/CometChatWorkspace/src/components/Messages/CometChatMessageHeader/SharedMedia2';
import CometChatUserProfile from '../screens/prospect/tabs/ambassador/AmbassadorProfile';
import OptionalField from '../screens/auth/OptionalField';
import Filter from '../screens/prospect/tabs/ambassador/Filter2';

enableScreens();
const hideHeader = { headerShown: false };
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator<RootBottomParamList>();
const width = Dimensions.get('window').width;
const screen_height = Dimensions.get('screen').height

const ConversationStack = (props: any) => {
    return (
        <Stack.Navigator initialRouteName='Conversation'>
            <Stack.Screen name={'Conversation'} component={Conversation} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}
const CalendarStack = (props: any) => {
    return (
        <Stack.Navigator initialRouteName='Calendar'>
            <Stack.Screen name={'Calendar'} component={Calendar} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const ProsConversationStack = (props: any) => {
    return (
        <Stack.Navigator initialRouteName='ProspectConversations'>
            <Stack.Screen name={'ProspectConversations'} component={ProspectConversations} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const ProsSchedulerStack = (props: any) => {
    return (
        <Stack.Navigator initialRouteName='Calendar'>
            <Stack.Screen name={'Scheduler'} component={Scheduler} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const ProsAmbassadorStack = (props: any) => {
    return (
        <Stack.Navigator initialRouteName='Ambassadors'>
            <Stack.Screen name={'Ambassadors'} component={Ambassadors} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const BottomTabsNavigator = () => {
    const isFocused = useIsFocused();
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo.college_data[0]?.font_color;
    return (
        <Tab.Navigator initialRouteName='ConversationBar' backBehavior='history'
            screenOptions={{
                tabBarStyle: { backgroundColor: Colors.white, height: screen_height * 0.08 },
                tabBarActiveTintColor: primaryColor,
                tabBarInactiveTintColor: Colors.bottomInactive,
                tabBarLabelStyle: { fontSize: 12, bottom: '10%', fontFamily:'InterSemiBold' }
            }} >

            {/* borderTopWidth: focused ? 2 : 0, borderTopColor: color, borderTopRightRadius: 2, borderTopLeftRadius: 2  */}

            < Tab.Screen name="ConversationBar" component={ConversationStack} options={{
                tabBarLabel: 'Conversations',
                headerShown: false, tabBarIcon: ({ focused, color }) => (
                    <View style={{ height: 55, width: 85, justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={focused ? Icons.IcConversation : Icons.IcConversation} resizeMode='contain' className='w-6 h-6' tintColor={color} />
                        {/* <ConversationIcon width={27} height={27} /> */}
                    </View>
                )
            }} />

            < Tab.Screen name="CalendarBar" component={CalendarStack} options={{
                tabBarLabel: 'Scheduler',
                headerShown: false, tabBarIcon: ({ focused, color }) => (
                    <View style={{ height: 55, width: 85, justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={focused ? Icons.IcScheduleFilled : Icons.IcScheduleFilled} resizeMode='contain' className='w-6 h-6' tintColor={color} />
                    </View>
                )
            }} />

        </Tab.Navigator >
    );
}

const ProsBottomTabsNavigator = () => {
    let isFocused = useIsFocused()
    let APP_ID = COMETCHAT_CONSTANTS.APP_ID
    let REGION = COMETCHAT_CONSTANTS.REGION
    let API_KEY = COMETCHAT_CONSTANTS.API_KEY
    let dispatch = useDispatch();
    useEffect(() => {
        getConversationList()
    }, [])
    const getConversationList = async () => {
        let unreadmessage = await Utils.getData('unreadMessageCount');
        let prospectId = await Utils.getData('prospect_cometchat_uid');
        new CometChatManager().getLoggedInUser().then((user: any) => {
            if (user) {
                new ConversationListManager().fetchNextConversation().then((o: any) => {
                    let r = o.filter((t: any) => t.unreadMessageCount > 0)
                    dispatch(setCometChatInfo(r.length))
                })
            }
        })
    }

    useEffect(() => {
        getConversationList()
    }, [isFocused])

    const upcomingScheduleData = useSelector((state: any) => {
        return state.upcomingDataReducer?.upcomingData
    })

    const unreadMessageCount = useSelector((state: any) => {
        return state.cometchatInfo.cometChatInfo
    })
    const instituteInfo = useSelector((state: any) => {
        return state.instituteInfoReducer?.instituteInfo
    })
    const primaryColor = instituteInfo?.college_data[0]?.font_color;

    return (
        <Tab.Navigator initialRouteName='ProsAmbassadorsBar' backBehavior='history'
            screenOptions={{
                tabBarStyle: { backgroundColor: Colors.white, height: screen_height * 0.08 },
                tabBarActiveTintColor: primaryColor,
                tabBarInactiveTintColor: Colors.bottomInactive,
                tabBarLabelStyle: { fontSize: 12, bottom: '10%',fontWeight: 'bold' },
            }} >

            {/* borderTopWidth: focused ? 2 : 0, borderTopColor: color, borderTopRightRadius: 2, borderTopLeftRadius: 2  */}

            < Tab.Screen name="ProsAmbassadorsBar" component={ProsAmbassadorStack} options={{
                tabBarLabel: 'Ambassadors',
                headerShown: false, tabBarIcon: ({ focused, color }) => (
                    <View style={{ height: 55, width: 130, justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={focused ? Icons.IcAmbassador : Icons.IcAmbassador} resizeMode='contain' className='w-6 h-6' tintColor={color} />
                    </View>
                )
            }} />

            < Tab.Screen name="ProsConversationBar" component={ProsConversationStack} options={{
                tabBarLabel: unreadMessageCount > 0 ? `Conversations (${unreadMessageCount})` : 'Conversations',

                headerShown: false, tabBarIcon: ({ focused, color }) => (
                    <View style={{ height: 55, width: 130, justifyContent: 'center', alignItems: 'center' }}>
                        {
                            unreadMessageCount > 0 ?
                                <FastImage source={focused ? Icons.IcChatUnread : Icons.IcChatUnread} resizeMode='contain' className='w-6 h-6' />
                                :
                                <FastImage source={focused ? Icons.IcConversation : Icons.IcConversation} resizeMode='contain' className='w-6 h-6' tintColor={color} />
                        }
                    </View>
                )
            }} />

            < Tab.Screen name="ProSchedulerBar" component={ProsSchedulerStack} options={{
                tabBarLabel: upcomingScheduleData?.length == 0 ? 'Scheduler' : `Scheduler (${upcomingScheduleData?.length})`,
                headerShown: false, tabBarIcon: ({ focused, color }) => (
                    <View style={{ height: 55, width: 130, justifyContent: 'center', alignItems: 'center' }}>
                        <FastImage source={focused ? Icons.IcScheduleFilled : Icons.IcScheduleFilled} resizeMode='contain' className='w-6 h-6' tintColor={color} />
                    </View>
                )
            }} />

        </Tab.Navigator >
    );
}


const AmbassadorStack = () => {
    const dispatch = useDispatch();
    const net = NetInfo.addEventListener(state => {
        dispatch(setInternetStatus(state.isConnected))
    });
    return (
        <Stack.Navigator initialRouteName='BottomTabsNavigator' screenOptions={{headerShown:false, animation:'none'}} >
            <Stack.Screen name={'BottomTabsNavigator'} component={BottomTabsNavigator} options={{ headerShown: false }} />
            <Stack.Screen name={'AddAvailability'} component={AddAvailability} options={{ headerShown: false }} />
            <Stack.Screen name={'AmbassadorMenu'} component={AmbassadorMenu} options={{ headerShown: false }} />
            <Stack.Screen name={'AmbassPrfoile'} component={AmbassadorPrfoile} options={{ headerShown: false }} />
            <Stack.Screen name={'AmbassadorEditProfile'} component={AmbassadorEditProfile} options={{ headerShown: false }} />
            <Stack.Screen name={'CometChatConversationListWithMessages'} component={CometChatConversationListWithMessages} options={{ headerShown: false }} />
            <Stack.Screen name="Conversation" component={CometChatConversationListWithMessages} options={{ headerShown: false }}/>
            <Stack.Screen name="ConversationComponent" component={CometChatConversationList}/>
            <Stack.Screen name="Group" component={CometChatGroupListWithMessages} />
            <Stack.Screen name="GroupComponent" component={CometChatGroupList} />
            <Stack.Screen name="Users" component={CometChatUserListWithMessages} />
            <Stack.Screen name="UsersComponent" component={CometChatUserList} />
            <Stack.Screen name="CometChatMessages" component={CometChatMessages} />
            <Stack.Screen name="CometChatSharedMedia" component={CometChatSharedMedia} />
            <Stack.Screen name="BlockListUsers" component={BlockListUsers} />
            <Stack.Screen name="Notes" component={Notes} />
            <Stack.Screen name="NewNotes" component={NewNotes} />
            <Stack.Screen name="SharedMedia2" component={SharedMedia2} />
            <Stack.Screen name="CometChatUserProfile" component={CometChatUserProfile} />
        </Stack.Navigator>
    )
}

const ProspectStack = () => {
    const dispatch = useDispatch();
    const net = NetInfo.addEventListener(state => {
        dispatch(setInternetStatus(state.isConnected))
    });
    return (
        <Stack.Navigator initialRouteName='Institution' screenOptions={{headerShown:false, animation:'none'}} >
            <Stack.Screen name={'Ambassadors'} component={Ambassadors} options={{ headerShown: false }} />
            <Stack.Screen name={'Institution'} component={Institutions} options={{ headerShown: false }} />
            <Stack.Screen name={'AddInstitute'} component={AddInstitute} options={{ headerShown: false }} />
            <Stack.Screen name={'ProsBottomTabsNavigator'} component={ProsBottomTabsNavigator} options={{ headerShown: false }} />
            <Stack.Screen name={'AmbassadorProfile'} component={AmbassadorProfile} options={{ headerShown: false }} />
            <Stack.Screen name={'ScheduleChat'} component={ScheduleChat} options={{ headerShown: false }} />
            <Stack.Screen name={'Menu'} component={Menu} options={{ headerShown: false }} />
            <Stack.Screen name={'Profile'} component={Profile} options={{ headerShown: false }} />
            <Stack.Screen name={'EditProfile'} component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name={'Signup'} component={Signup} options={{ headerShown: false }} />
            <Stack.Screen name={'Notification'} component={Notification} options={{ headerShown: false }} />
            <Stack.Screen name={'CometChatConversationListWithMessages'} component={CometChatConversationListWithMessages} options={{ headerShown: false }} />
            <Stack.Screen name="Conversation" component={CometChatConversationListWithMessages} options={{ headerShown: false }}/>
            <Stack.Screen name="ConversationComponent" component={CometChatConversationList}/>
            <Stack.Screen name="Group" component={CometChatGroupListWithMessages} />
            <Stack.Screen name="GroupComponent" component={CometChatGroupList} />
            <Stack.Screen name="Users" component={CometChatUserListWithMessages} />
            <Stack.Screen name="UsersComponent" component={CometChatUserList} />
            <Stack.Screen name="CometChatMessages" component={CometChatMessages} />
            <Stack.Screen name="CometChatSharedMedia" component={CometChatSharedMedia} />
            <Stack.Screen name="Filter" component={Filter} />
            <Stack.Screen name="SharedMedia2" component={SharedMedia2} />
            <Stack.Screen name="CometChatUserProfile" component={CometChatUserProfile} />
        </Stack.Navigator>
    )
}

const AuthStack = () => {
    const dispatch = useDispatch();
    const net = NetInfo.addEventListener(state => {
        dispatch(setInternetStatus(state.isConnected))
    });
    return (
        <Stack.Navigator initialRouteName='Login' screenOptions={{headerShown:false, animation:'none'}} >
            <Stack.Screen name={'Login'} component={Login} options={{ headerShown: false }} />
            <Stack.Screen name={'Otp'} component={Otp} options={{ headerShown: false }} />
            <Stack.Screen name={'CompleteProfile'} component={CompleteProfile} options={{ headerShown: false }} />
            <Stack.Screen name={'OptionalField'} component={OptionalField} options={{ headerShown: false }} />
            <Stack.Screen name={'NetworkError'} component={NetworkError} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const SplashStack = () => {
    const dispatch = useDispatch();
    const net = NetInfo.addEventListener(state => {
        dispatch(setInternetStatus(state.isConnected))
    });
    return (
        <Stack.Navigator initialRouteName='Splash' screenOptions={{headerShown:false, animation:'none'}} >
            <Stack.Screen name={'Splash'} component={Splash} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const DrawerNavigator = () => {
    return (
        <Stack.Navigator initialRouteName='SplashStack' screenOptions={{headerShown:false, animation:'none'}}>
            <Stack.Screen name='SplashStack' component={SplashStack} options={hideHeader} />
            <Stack.Screen name='AuthStack' component={AuthStack} options={hideHeader} />
            <Stack.Screen name='ProspectStack' component={ProspectStack} options={hideHeader} />
            <Stack.Screen name='AmbassadorStack' component={AmbassadorStack} options={hideHeader} />
        </Stack.Navigator>
    )
}

const Navigator = () => {
    const isConnected = useSelector((state: any) => {
        return state.internetReducer.isConnected
    })
    return (
        <NavigationContainer>
            {
                isConnected ?
                    <DrawerNavigator />
                    :
                    <NetworkError />
            }
        </NavigationContainer>
    )
}

export default Navigator